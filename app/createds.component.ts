import { Component, OnInit, Input }		from '@angular/core';
import { Router } from '@angular/router';
import { QueryService } 							from './query.service';
import { Globals } 										from './globals';

import { SelectItem } from 'primeng/primeng';

/*
 * CreateDV Component
 * 
 */
@Component({
	moduleId: module.id,
	selector: 'createds',
	templateUrl: 'createds.component.html',
	styleUrls: ['createds.component.css']
})

export class CreateDSComponent implements OnInit {

	newDsName: string; 			// New dataset name to create

	metaDatatypes: any[] = [];

	datatypes: SelectItem[] = [];
	keys: SelectItem[];

	selectedDatatype: any;
	selectedKey: any; 

	// query result message
	execution_time: number;
	status: string;
	errors: string[] = [];

	constructor(
		private router: Router,
		private globals: Globals,
		private queryService: QueryService
	) {}

	/**
	 * createDataset()
	 * - Create new dataset
	 */
	createDataset() {
		const _dvName = this.globals.selectedDataverse;
		const _dsName = this.newDsName;

		this.queryService
			.sendQuery(
				`
					USE ${_dvName};
					CREATE DATASET ${_dsName} (${this.selectedDatatype.name})
						PRIMARY KEY ${this.selectedKey};
				`
			)
			.then(res => {
				res = JSON.parse(res);
				if ("errors" in res) {
					for (let i = 0; i < res["errors"].length; i++)
						this.errors.push(res["errors"][i]["msg"]);
				}

				if ("results" in res) {
				}

				this.execution_time = res.metrics.executionTime;
				this.status = res.status;

				// update sidebar
				this.globals.updateSidebar();
			})
		);

	}

	getDatatypes(){
		const dvName = this.globals.selectedDataverse;
		const dsName = this.globals.selectedDataset;
		this.queryService
			.sendQuery("SELECT VALUE dt FROM Metadata.`Datatype` dt;")
			.then(res => {
				const results = JSON.parse(res).results;
				this.MetadataDatatype = results;

				// making a table
				for ( let i = 0; i < results.length; i++ ) {
					const _datatype = results[i]["DatatypeName"];
					const _dataverse = results[i]["DataverseName"];
						
					if (_dataverse == dvName ){
						// for previewing of the datatype
						this.metaDatatypes.push(results[i]);

						// make dropdown items
						if ("Record" in results[i]["Derived"]){

							// add label, value to each record's fields
							let fields = results[i]["Derived"]["Record"]["Fields"];
							for ( let j = 0 ; j < fields.length ; j++){
								fields[j]["name"] = fields[j]["FieldName"];
								fields[j]["type"]	= fields[j]["FieldType"];
								fields[j]["value"]	= fields[j]["FieldName"];
							}

							this.datatypes.push(
								{ 
									label: results[i]["DatatypeName"], 
									value: { 
										name: results[i]["DatatypeName"], 
										fields: fields 
									}
								}
							);
								
						}
					}
				}
				
				this.selectedDatatype = this.datatypes[0].value;
			});
	}

	addDatatype(){
		this.router.navigate(['/createdt']);
	}

	ngOnInit(): void {
		this.getDatatypes();
	}
}
