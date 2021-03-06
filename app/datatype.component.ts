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
import { Component, OnInit, OnDestroy } from '@angular/core';

import { DataTableModule, SharedModule } from 'primeng/primeng'; 
import { QueryService } from './query.service';

import { Globals } from './globals';

/**
 * Datatype-tab
 * show datatype of given dataverse and dataset
 */
@Component({
	moduleId: module.id, 
	selector: 'datatype-tab',
	templateUrl: 'datatype.component.html',
	styleUrls: ['datatype.component.css']
})

export class DatatypeComponent implements OnInit, OnDestroy {

	datatype: string;
	isOpen : boolean;

	/**
	 * needed for find the nested datatype
	 */
	MetadataDataset : any[];
	MetadataDatatype : any[];
	nestedDatatypes = [];
	nestedDatatypeInSpecialCase = [];

	/**
	 * table data
	 */
	data: any[];
	cols: any[] = [];

	/**
	 * tables' data for nested datatype 
	 */
	nestedData: any[] = [];
	nestedCols: any[] = [];
	selectedNestedDatatype: string = "";

	constructor(
		private globals: Globals,
		private queryService: QueryService
	) { }
	

	/**
	 * this function called in buildDatatypeTable()
	 * query result contains 
	 * => DataverseName, DatasetName, DataverseName, DatatypeName 
	 * 
	 * try to find a row that contains selected dataverse & dataset 
	 * and get the datatypeName 
	 * finally, store it in this.datatype
	 */
	getDatatype(): void {
		const dvName = this.globals.selectedDataverse;
		const dsName = this.globals.selectedDataset;

		this.queryService
			.sendQuery("SELECT VALUE ds FROM Metadata.`Dataset` ds;")
			.then(res => {
				const results = JSON.parse(res).results;
				this.MetadataDataset = results;

				for ( var i = 0; i < results.length; i++ ) {
					const _dvName = results[i]["DataverseName"];
					const _dsName = results[i]["DatasetName"];
					// find datatype of selected dvName and dsName
					if ( _dvName == dvName && _dsName == dsName){
						this.datatype = results[i]["DatatypeName"];
						break;
					}
				}

				// next, find datatype in metadata
				this.getDatatypeDetail();
			});
	}
	
	/**
	 * this function is called in getDatatypeDetail()
	 * to process special case nested datatype
	 * like {{}}, [] (UN)ORDEREDLIST
	 *
	 * parameter specialCaseList has an array of special case type
	 * [
	 * 	{ "FieldName": "hashtags", "FieldType": "type_tweet_hashtags", "IsNullable": true }
	 * 	...
	 * 	{ "FieldName": "user_mentions", "FieldType": "type_tweet_user_mentions", "IsNullable": true }
	 * ]
	 */
	processSpecialCase(specialCaseList: any[]): void{
		const dvName = this.globals.selectedDataverse;
		const dsName = this.globals.selectedDataset;

		for (let i = 0 ; i < specialCaseList.length; i++){
			const specialType = specialCaseList[i];
			
			// find special type's detail and update special case's FieldType 
			for (let j = 0 ; j < this.MetadataDatatype.length; j++){
				const mtdt = this.MetadataDatatype[j];

				if (mtdt["DataverseName"] == dvName && mtdt["DatatypeName"] == specialType["FieldType"]){
					// tag : UNORDEREDLIST or ORDEREDLIST
					const tag = mtdt["Derived"]["Tag"];
					let updatedValue = "";
					let innerValue = "";
					let specialCase = false;
					
					if (tag == "UNORDEREDLIST"){
						updatedValue = `{{ ${mtdt["Derived"]["UnorderedList"]} }}`;		
						innerValue = mtdt["Derived"]["UnorderedList"];
						specialCase = true;
					}
					if (tag == "ORDEREDLIST"){
						updatedValue = `[ ${mtdt["Derived"]["OrderedList"]} ]`;		
						innerValue = mtdt["Derived"]["OrderedList"];
						specialCase = true;
					}

					// If inner-item's datatype is not a primitive type ex) int64, string, datetime
					// add it to nestedDatatypeInSpecialCase for making table of nested data 
					// because that type can be another table (nested data type)
					//
					// * primitive type's dataverse => "Metadata"
					// * non-primitive type's dataverse => something else 
					//
					for (let l = 0 ; l < this.MetadataDatatype.length; l++){
						const _mtdt = this.MetadataDatatype[l];
						if (_mtdt["DataverseName"] == dvName && _mtdt["DatatypeName"] == innerValue){
							this.nestedDatatypeInSpecialCase.push(_mtdt);
							break;
						}
					}

					// update FieldType of this.data (table data)
					for (let l = 0 ; l < this.data.length ; l++){ 
						// update special case's FieldType (will be shown on the table)
						if (specialCase && this.data[l]["FieldType"] == specialType["FieldType"]){
							this.data[l]["FieldType"] = updatedValue;	
							break;
						}
					}
				}
				// if end
			}
			// for let j end
		}
		// for let i end
	}	
	
	/**
	 * this function is called in getDatatypeDetail()
	 * to make nested data type's table 
	 */
	makeNestedDatatypeTable(): void{
		const dvName = this.globals.selectedDataverse;
		const dsName = this.globals.selectedDataset;

		if (!this.data) return;

		for ( var i = 0 ; i < this.data.length; i++ ){
			// current table's fields
			const type = this.data[i]["FieldType"];
			
			// scan Metadata's Datatype
			for ( var j = 0 ; j < this.MetadataDatatype.length; j++){
				const _dvName = this.MetadataDatatype[j]["DataverseName"];
				const _dtName = this.MetadataDatatype[j]["DatatypeName"];
				if ( _dvName == dvName && _dtName == type ){
					this.nestedDatatypeInSpecialCase.push(this.MetadataDatatype[j]);
				}
			}
		}
		
		for ( let i = 0 ; i < this.nestedDatatypeInSpecialCase.length; i++){
			const record = this.nestedDatatypeInSpecialCase[i]["Derived"]["Record"];	
			const data = record["Fields"];
			
			// make cols
			let cols = [];
			const labels = Object.keys(record["Fields"][0]);
			for (var j = 0 ; j < labels.length; j++){
				cols.push(labels[j]);
			}
			this.nestedData.push(data); 
			this.nestedCols.push(cols); 
		}
	}
	
	/**
	 * Now, we got the selected dataset's datatype's name
	 * So, will try to get its detail (Fields information)
	 * 
	 * query result contains
	 * "DataverseName", "DatatypeName", "Derived": {"TAG", "isAnonymous", "Record":{"isOpen", "Fields"}}
	 * ex) 
	 * 		{ 
	 * 			"DataverseName": "twitter", 
	 *			"DatatypeName": "type_us_state", 
	 *			"Derived": { 
	 *				"Tag": "RECORD", 
	 *				"IsAnonymous": false, 
	 *				"Record": { 
	 *					"IsOpen": false, 
	 *				  "Fields": [ 
	 *							{ "FieldName": "id", "FieldType": "int64", "IsNullable": false }, 
	 *							... ,  
	 *							{ "FieldName": "geometry", "FieldType": "polygon", "IsNullable": false } 
	 *					] 
   *				} 
	 *			}, 
	 *			"Timestamp": "Fri Mar 31 23:42:28 KST 2017" 
	 *		}
	 *
	 * Special case : ORDEREDLIST => [], UNORDEREDLIST => {{}}
	 * we found that predefined datatype like ORDEREDLIST, and UNORDEREDLIST 
	 *
	 * if the shape of FieldType(in Fields in Record in Derived) looks like (DatatypeName + "_" + FieldName)
	 *
	 * ex) For examples, when DatatypeName is type_tweet
	 * 
	 *     { "FieldName": "hashtags", "FieldType": "type_tweet_hashtags", "IsNullable": true }
	 *     { "FieldName": "user_mentions", "FieldType": "type_tweet_user_mentions", "IsNullable": true }
	 *		these will be contain in the specialCaseList
	 *
	 *		and then, we can find it's details by searching that FieldType in the same metadata
	 * 		For examples...
	 *
	 *     { "DataverseName": "twitter", "DatatypeName": "type_tweet_hashtags", 
	 *       "Derived": { "Tag": "UNORDEREDLIST", "IsAnonymous": true, "UnorderedList": "string" }, 
	 *       "Timestamp": "Tue Feb 28 13:27:26 KST 2017" 
	 *     }
	 *     { "DataverseName": "TinySocial", "DatatypeName": "GleambookUserType_employment", 
	 *       "Derived": { "Tag": "ORDEREDLIST", "IsAnonymous": true, "OrderedList": "EmploymentType" }, 
	 *       "Timestamp": "Fri Feb 10 23:53:38 KST 2017" 
	 *     }
	 *
	 */
	getDatatypeDetail(): void {
		const dvName = this.globals.selectedDataverse;
		const dsName = this.globals.selectedDataset;

		this.queryService
			.sendQuery("SELECT VALUE dt FROM Metadata.`Datatype` dt;")
			.then(res => {
				const results = JSON.parse(res).results;
				this.MetadataDatatype = results;

				// making a table
				for ( var i = 0; i < results.length; i++ ) {
					const _datatype = results[i]["DatatypeName"];
					const _dataverse = results[i]["DataverseName"];
							
					if (_dataverse == dvName && _datatype == this.datatype){
						const record = results[i]["Derived"]["Record"];

						// all the information for type details are in the "Fields"
						this.data = record["Fields"]; 

						// is selected datatype is open type ?	
						this.isOpen = record["IsOpen"]; 

						// find special case ("_FieldName" in FieldType)
						let specialCaseList = [];
						for (let j = 0 ; j < this.data.length; j++){
							if (this.data[j]["FieldType"].includes("_" + this.data[j]["FieldName"])){
								specialCaseList.push(this.data[j]);
							}
						}

						// process special case ([ordered list], {{unordered list}}) 
						this.processSpecialCase(specialCaseList);
						
						// make columns using the first row
						const labels = Object.keys(record["Fields"][0]);
						for (var j = 0 ; j < labels.length; j++){
							this.cols.push(labels[j]);
						}
					}
				}
				this.makeNestedDatatypeTable();
			});
	}
	
	/**
	 * send query and get datatype information 
	 * buildDatatypeTable() => getDatatype() => getDatatypeDetail() => processSpecialCase() => makeNestedDatatypeTable()
	 */
	buildDatatypeTable(): void {
		this.cols = [];

		const dvName = this.globals.selectedDataverse;
		const dsName = this.globals.selectedDataset;

		// if one of selected dataverse & dataset doesn't exist
		if (!dvName || !dsName) return;

		// first, find datatype
		this.getDatatype();

	}

	/**
	 * when user click nested data type
	 */
	selectNestedType(datatype:string):void{
		this.selectedNestedDatatype = datatype;
	}	

	/**
	 * call buildDatatypeTable() when this component loaded
	 */
	ngOnInit(): void {
		this.buildDatatypeTable();
	}

	ngOnDestroy(): void {
	}
}
