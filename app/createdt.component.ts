import { Component, OnInit, Input }		from '@angular/core';
import { QueryService } 							from './query.service';
import { Globals } 										from './globals';

import { SelectItem } from 'primeng/primeng';

/*
 * CreateDT Component
 * 
 */
@Component({
	moduleId: module.id,
	selector: 'createdt',
	templateUrl: 'createdt.component.html',
	styleUrls: ['createdt.component.css']
})

export class CreateDTComponent implements OnInit {

	newDtName: string; 			// New dataverse name to create

	openOrClosed: string = "open";

	fields: any[]  = [];
	
	// primitive type and user defined type
	primitives: string[] = []; 
	userdefines: string[] = [];
	fieldtypes: SelectItem[] = [];

	metas: SelectItem[] = [];

	query: string = "";

	// query result message
	execution_time: number;
	status: string;
	errors: string[] = [];

	constructor(
		private globals: Globals,
		private queryService: QueryService
	) {
		this.metas.push({ label: "None", value: "none" });
		this.metas.push({ label: "Ordered List [+]", value: "ordered" });
		this.metas.push({ label: "Unordered List {{+}}",value: "unordered" });
	}


	addField(){
		this.fields.push({
			name: undefined,
			type: this.fieldtypes[0].value,
			meta: this.metas[0].value, 
			isNullable: false
		});
	}

	removeField(index: number){
		this.fields.splice(index, 1);	

		if (this.fields.length == 0){
			this.addField();
		}
	}

	// TODO: use constant string
	setQuery(){
		const _dvName = this.globals.selectedDataverse;
		this.query = `USE ${_dvName}; \n`;
		this.query += `CREATE TYPE ${this.newDtName} AS ${this.openOrClosed} {\n`;
		for (let i = 0 ; i < this.fields.length; i++){
			const f = this.fields[i];

			this.query += `\t${f.name}: `;

			if (f.meta == "ordered")
				this.query += "[ ";	
			else if (f.meta == "unordered")
				this.query += "{{ ";	

			this.query += `${f.type}`;			

			if (f.meta == "ordered")
				this.query += " ]";	
			
			else if (f.meta == "unordered")
				this.query += " }}";	

			this.query += `${f.isNullable?"?":""}`;			

			if (i < this.fields.length - 1) this.query += ",\n";
		}
		this.query += `\n}`;
	}

	/**
	 * createDatatype()
	 * - Create new datatype 
	 */
	createDatatype() {
		const _dvName = this.globals.selectedDataverse;
		const _dsName = this.newDsName;

		this.setQuery();

		console.log("query", 
				this.query.replace(/\n/g, ""));

		this.queryService
			.sendQuery(
				this.query.replace(/\n/g, "")
			)
			.then(res => {
				res = JSON.parse(res);
				if ("errors" in res) {
					for (let i = 0; i < res["errors"].length; i++)
						this.errors.push(res["errors"][i]["msg"]);
				}

				this.execution_time = res.metrics.executionTime;
				this.status = res.status;

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

				// making a table
				for ( let i = 0; i < results.length; i++ ) {
					const _datatype = results[i]["DatatypeName"];
					const _dataverse = results[i]["DataverseName"];

					if (_dataverse == dvName){
						this.userdefines.push(_datatype);
						this.fieldtypes.push({label:_datatype, value:_datatype});
					}

					else if (!("Derived" in results[i])){
						this.primitives.push(_datatype);	
						this.fieldtypes.push({label:_datatype, value:_datatype});
					}
				}

				this.addField();
			});
	}

	ngOnInit(): void {
		this.getDatatypes();
	}
}
