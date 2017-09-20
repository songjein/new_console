/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Injectable, Inject, forwardRef } from '@angular/core';

import { Router } from '@angular/router';

import { MenuItem } from 'primeng/primeng';

import { QueryService } from './query.service';

/**
 * global variables shared by all components as a service
 */
Injectable()
export class Globals{

	selectedDataverse: string; 

	selectedDataset: string;

	selectedDatatype: string;
	MetadataDatatype: any[] ;
	specialCasePairs: any;

	selectedTab: string;

	// sidebar items
	sidebarItems: MenuItem[] = [];

	constructor(
		@Inject(forwardRef(() => QueryService))	
		private queryService: QueryService,
		@Inject(forwardRef(() => Router))	
		private router : Router 
	){}
	
	/**
	 * will be used in browse / query component
	 * for processing special type ; {{}}, []
	 */
	buildSpecialCasePairs(dvName: string, dsName:string[]){

		// for each dsName (join query can have more than one dataset)
		for (let i = 0 ; i < dsName.length ; i ++){
			// get datatype
			this.queryService
				.sendQuery("SELECT VALUE ds FROM Metadata.`Dataset` ds;")
				.then(res => {

					const results = JSON.parse(res).results;
					for (let j = 0; j < results.length; j++ ) {
						const _dvName = results[j]["DataverseName"];
						const _dsName = results[j]["DatasetName"];
						// find datatype of selected dvName and dsName
						if ( _dvName == dvName && _dsName == dsName[i] ){
							this.selectedDatatype = results[j]["DatatypeName"];
							break;
						}
					}
					this.getDatatypeDetail(dvName, dsName[i])
				});
		}
	}	

	getDatatypeDetail(dvName: string, dsName: string){

		this.queryService
		.sendQuery("SELECT VALUE dt FROM Metadata.`Datatype` dt;")
		.then(res => {
			const results = JSON.parse(res).results;
			this.MetadataDatatype = results;

			for ( var i = 0; i < results.length; i++ ) {
				const _datatype = results[i]["DatatypeName"];
				const _dataverse = results[i]["DataverseName"];
						
				if (_dataverse == dvName && _datatype == this.selectedDatatype){
					const record = results[i]["Derived"]["Record"];

					// all the information for type details are in the "Fields"
					const data = record["Fields"]; 

					// find special case ("_FieldName" in FieldType)
					let specialCaseList = [];
					for (let j = 0 ; j < data.length; j++){
						if (data[j]["FieldType"].includes("_" + data[j]["FieldName"])){
							specialCaseList.push(data[j]);
						}
					}

					// process special case ([ordered list], {{unordered list}}) 
					this.processSpecialCase(specialCaseList, dvName, dsName);
				}
			}
		});
	}

	processSpecialCase(specialCaseList: any[], dvName: string, dsName: string){
		this.specialCasePairs = {};

		for (let i = 0 ; i < specialCaseList.length; i++){
			const specialType = specialCaseList[i];
			
			// find special type's detail 
			for (let j = 0 ; j < this.MetadataDatatype.length; j++){
				const mtdt = this.MetadataDatatype[j];

				if (mtdt["DataverseName"] == dvName && mtdt["DatatypeName"] == specialType["FieldType"]){
					const tag = mtdt["Derived"]["Tag"];
					
					if (tag == "UNORDEREDLIST" || tag == "ORDEREDLIST"){
						this.specialCasePairs[specialType["FieldName"]] = tag;
					}
				}
			}
			// for let j end
		}
		// for let i end
	}



	/*
	 * NOTICE : getDataverse() and getDataset() 
	 * were originally in the sidebar components..
	 * but, moved to globals.ts 
	 * because many components need to access those functions
	 * TODO: function to add one item 
	 **/

	updateSidebar(){
		this.getDataverse();
	}

	/**
	 * get all dataverses in the database
	 */
	getDataverse(): void {
		this.sidebarItems = [];

		this.queryService
			.sendQuery("SELECT VALUE dv FROM Metadata.`Dataverse` dv;")
			.then(res => {
				// parse response body
				const dv = JSON.parse(res).results;

				// Add 'New' to connect to page for adding new dataverse
				this.sidebarItems.push(
					{
						label: 'New',
						icon:'fa-plus',
						command: (e) => {
							this.router.navigate(['/proxy/createdv']);
						}
					}
				);

				for (var i = 0; i < dv.length; i++){
					if (dv[i]["DataverseName"] == "Default") continue;
					this.sidebarItems.push(
						{ 
							label: dv[i]["DataverseName"], 
							icon: '', 
							items: [
									{
										label: 'New',
										icon: 'fa-plus-square-o',
										command: (e) => {
											this.router.navigate(['/proxy/createds']);
										}
									}
								],
							command: (e) => {
								this.selectedDataset = null;
								this.selectedDataverse = e.item.label;	
							}
						}
					);
				}

				// call getDataset() after getting the dataverses 
				this.getDataset(); 
			});
	}

	/**
	 * get all datasets in the dataverse 
	 */
	getDataset(): void {
		this.queryService
			.sendQuery("SELECT VALUE ds FROM Metadata.`Dataset` ds;")
			.then(res => {
				// parse response body
				const ds = JSON.parse(res).results;
				for (var i = 0; i < ds.length; i++){
					const dvName = ds[i]["DataverseName"];
					const dsName = ds[i]["DatasetName"];

					const idx = this.sidebarItems.findIndex(x => x["label"] == dvName);

					this.sidebarItems[idx]["items"].push(
						{ 
							label: dsName, 
							icon: '', 
							command: (e) => {
								this.selectedDataverse = dvName;	
								this.selectedDataset = e.item.label;

								// navigate through the proxy component
								// for the component in router-outlet refreshing
								// /proxy/:routed-component
								if (this.selectedTab == "browse")
									this.router.navigate(['/proxy/browse']);
								else if (this.selectedTab == "datatype")
									this.router.navigate(['/proxy/datatype']);
								else
									this.router.navigate(['/proxy/browse']);
							}
						}
					);
				}

			});
	}


}
