import { Component, OnInit, Input }		from '@angular/core';
import { QueryService } 							from './query.service';
import { Globals } 										from './globals';

import { SelectItem } from 'primeng/primeng';

/*
 * Drop Component
 * 
 */
@Component({
	moduleId: module.id,
	selector: 'drop',
	templateUrl: 'drop.component.html',
	styleUrls: ['drop.component.css']
})

export class DropComponent implements OnInit {
	
	selectedDV: string;
	selectedDS: string;
	selectedDT: string;

	dataverses: SelectItem[] = [];
	datatypes: SelectItem[] = [];
	datasets: SelectItem[] = [];


	dropType: string ;

	// query result message
	execution_time: number;
	status: string;
	errors: string[] = [];

	constructor(
		private globals: Globals,
		private queryService: QueryService
	) {
	}


	dropConfirm(option: string){
		this.dropNameConfirm = "";
		this.dropType = option;
	}

	/**
	 * drop()
	 * - drop dataverse, dataset, or datatype
	 */
	drop(type: string) {
		let query = "";

		if (type == "dataverse"){
			if (this.selectedDV != this.dropNameConfirm){
				alert("Wrong Dataverse Name");	
				return;	
			}
			query = `DROP DATAVERSE ${this.selectedDV};`;
		}
		else if (type == "dataset"){
			if (this.selectedDS != this.dropNameConfirm){
				alert("Wrong Dataset Name");	
				return;	
			}
			query = `USE ${this.selectedDV}; DROP DATASET ${this.selectedDS};`;
		}
		else if (type == "datatype"){
			if (this.selectedDT != this.dropNameConfirm){
				alert("Wrong Datatype Name");	
				return;	
			}
			query = `USE ${this.selectedDV}; DROP TYPE ${this.selectedDT};`;
			console.log(query);
		}
		else {
			alert("Drop type error");	
		}

		console.log("drop query", query);
		
		this.queryService
			.sendQuery(
				query
			)
			.then(res => {
				res = JSON.parse(res);
				if ("errors" in res) {
					for (let i = 0; i < res["errors"].length; i++)
						this.errors.push(res["errors"][i]["msg"]);
				}

				this.execution_time = res.metrics.executionTime;
				this.status = res.status;

				if (this.status == "success"){
					this.getDatatype();	
					this.globals.updateSidebar();
				}

			})
		);

	}


	getDsDt(){
		this.getDataset(); 
		this.getDatatype(); 
	}


	getDataverse(){
		this.queryService
			.sendQuery("SELECT VALUE dv FROM Metadata.`Dataverse` dv;")
			.then(res => {
				const dvs = JSON.parse(res).results;
				
				for (var i = 0; i < dvs.length; i++){
					if (dvs[i]["DataverseName"] == "Default") continue;
					if (dvs[i]["DataverseName"] == "Metadata") continue;
					this.dataverses.push({
						label: dvs[i]["DataverseName"],
						value: dvs[i]["DataverseName"]
					});
				}

				// default value
				this.selectedDV = this.dataverses[0].value;
				this.getDsDt();
			});
	}

	getDataset(): void {
		this.datasets = [];

		this.queryService
			.sendQuery("SELECT VALUE ds FROM Metadata.`Dataset` ds;")
			.then(res => {
				// parse response body
				const ds = JSON.parse(res).results;
				for (var i = 0; i < ds.length; i++){
					const dvName = ds[i]["DataverseName"];
					const dsName = ds[i]["DatasetName"];

					if (dvName == this.selectedDV){
						this.datasets.push(
							{ 
								label: dsName, 
								value: dsName
							}
						);
					}
				}
			});
	}

	getDatatype(): void {
		this.datatypes = [];

		this.queryService
			.sendQuery("SELECT VALUE dt FROM Metadata.`Datatype` dt;")
			.then(res => {
				// parse response body
				const dt = JSON.parse(res).results;
				for (var i = 0; i < dt.length; i++){
					const dvName = dt[i]["DataverseName"];
					const dtName = dt[i]["DatatypeName"];

					if (dvName == this.selectedDV){
						this.datatypes.push(
							{ 
								label: dtName, 
								value: dtName
							}
						);
					}
				}
			});
	}



	ngOnInit(): void {
		this.getDataverse();
	}
}
