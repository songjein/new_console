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
import { Component, OnInit, ViewChild } from '@angular/core';

import { QueryService } from './query.service';
import { BrowseComponent } from './browse.component';

import { Globals } from './globals';

/**
 * query component
 * has editor (codemirror) for writing some query
 */
@Component({
	moduleId: module.id,
	selector: 'query-tab',
	templateUrl:'query.component.html',
	styleUrls: ['query.component.css']
})

export class QueryComponent implements OnInit {

	@ViewChild(BrowseComponent) child;

	/**
	 * view type
	 */
	types: SelectItem[];
	selectedType: string = "Table";

	// typed query
	query: string; 
	
	/**
	 * data, cols will be injected to the table 
	 */
	data: any[];
	allData: any[];
	cols: any[];

	/**
	 * column filter checkbox
	 */
	selectedColumns: string[] = [];

	// query result message
	execution_time: number;
	status: string;
	errors: string[] = [];

	/**
	 * expansion status
	 */
	expansions: any[] = Array(25); // must be the same with the number of rows in a page
	expanded: boolean = false;
	firstFetched: boolean;

	limit: number = 25; // maximum rows in one page
	pages: number[] = []; // page numbers
	isLoading: boolean = false;

	/**
	 * Query History 
	 */
	const QH_DELIM = "!@#$%^"; // query history delimeter
	const QH_KEY: string = "queryHistory"; // query history key
	queryHistory: string[];
	qhCursor: number;

	constructor(
		private globals: Globals,
		private queryService: QueryService
	) { 
		// mode config, codemirror
		this.config = { mode: "asterix", lineNumbers: true}	;

		// view type
		this.types = [];	
		this.types.push({label: "Table", value: "Table"});
		this.types.push({label: "JSON", value: "JSON"});
		this.types.push({label: "Tree", value: "Tree"});
	}

	/**
	 * Showing query result 
	 * TODO: pagination using limit, offset 
	 * (it looks like hard to insert [limit offset] to the user typed query)
	 */
	getQueryResult(query: string): void {
		this.data = undefined;
		this.cols = [];
		this.errors = []; 
		this.pages = [];
		this.selectedColumns = [];
		this.status = undefined; 
		
		/**
		 * only SQL++ support now
		 */
		this.isLoading = true;
		this.queryService
			.sendQuery(query)
			.then(res => {
				res = JSON.parse(res);
				if ("errors" in res){
					for (let i = 0; i < res["errors"].length; i++)
						this.errors.push(res["errors"][i]["msg"]);
				}
				if ("results" in res) this.processQueryResult(res);
				this.execution_time = res.metrics.executionTime;
				this.status = res.status;
				this.isLoading = false;
			});
	}
	
	/**
	 * process query result
	 */
	processQueryResult(result: any): void{
		
		this.allData = result.results;

		// generate page numbers
		for (let i = 0 ; i < this.allData.length / this.limit; i ++){
			this.pages.push(i + 1);
		}
		
		// look up the number/2 of rows data and build columns
		// make maximum length columns 
		for (let i = 0 ; i < this.allData.length / 2; i++){
			const keys = Object.keys(this.allData[i]);
			for ( var j = 0; j < keys.length; j ++ ) {
				if (!this.cols.includes(keys[j])) {
					this.cols.push(keys[j]);
					this.selectedColumns.push(keys[j]);	
				}
			}
		}

		this.getPageData(1);

		this.isLoading = false;
	}

	/**
	 * when click the page number, slice this.allData into this.data
	 */
	getPageData(pageNum: number){
		this.data = []
		const offset = this.limit * (pageNum - 1);
		const limit = offset + this.limit;
		this.data = this.allData.slice(offset, limit);
	}

	/**
	 * click cell
	 * row : selected row index
	 * col : selected col indexj
	 */
	expandCell(row:number, col:number, off: boolean):void{
		if (off){
			this.expansions[row] = null; 
			return;
		}
		
		const clickedData = this.data[row];
		const clickedColumn = this.cols[col];

		// if user clicked same cell
		if (this.expansions[row] == clickedData[clickedColumn]) {
			this.expansions[row] = null; 
			return;
		}

		this.expansions[row] = clickedData[clickedColumn];
	}

	/**
	 * expand all
	 */
	expandAll(col: string): void{
		// if already expanded
		if (this.expanded){
			// make expansions array empty 	
			for (let i = 0 ; i < this.data.length; i++){
				this.expansions[i] = null;
			}
			this.expanded= false;
			return;	
		}

		// expand all
		this.expanded= true;
		for (let i = 0 ; i < this.data.length; i++){
			this.expansions[i] = this.data[i][col];
		}
	}

	/**
	 * if click 'send query'
	 */
	sendQuery(){
		//this.getQueryResult(this.query.replace(/\n/g, " "));

		this.addQueryHistory(this.query);
		this.qhCursor = this.queryHistory.length;

		const dvds = this.extractDvDsName(this.query);
		this.child.updateBrowseComponent(dvds.dvName, dvds.dsNames);
		
		//const dvds = this.extractDvDsName(this.query);
		//this.globals.buildSpecialCasePairs(dvds.dvName, dvds.dsNames);
	}
	
	extractDvDsName(query: string){
		const items = query.replace(/,/g, " , ").replace(/;/g, "").split(" "); 

		items = items.filter(function(item){
			return item != "";
		});
		
		// "USE"'s index
		const useIdx= items.findIndex(function(element){
			return element.toLowerCase() == "use";
		});

		const dvName = items[useIdx + 1].trim();

		// "FROM"'s index
		const fromIdx = items.findIndex(function(element){
			return element.toLowerCase() == "from";
		});

		const dsNames = [items[fromIdx + 1].trim()];
		for (let i = fromIdx; i < items.length; i++){
			if (items[i] == ","){
				dsNames.push(items[i + 1].trim());
			}
		} 

		return {dvName: dvName, dsNames: dsNames};
	}

	loadQueryHistory(){
		// get history
		let queryHistory = localStorage.getItem(this.QH_KEY);
		if (queryHistory == null){
			this.queryHistory = [];
		}
		else {
			this.queryHistory = queryHistory.split(this.QH_DELIM);
		}
		this.qhCursor = this.queryHistory.length;
	}

	addQueryHistory(qh:string){
		// add history
		this.queryHistory.push(qh);
		// convert to string and save to localStorage
		localStorage.setItem(this.QH_KEY, this.queryHistory.join(this.QH_DELIM));
	}

	getPrevHistory(){
		if (this.qhCursor - 1  >= 0 )
		this.query = this.queryHistory[--this.qhCursor];
	}

	getNextHistory(){
		//TODO: exception 
		if (this.qhCursor + 1  <= this.queryHistory.length )
			this.query = this.queryHistory[++this.qhCursor];
	}

	clearHistory(){
		localStorage.clear();	
		this.loadQueryHistory();
	}

	ngOnInit(): void {
		this.query = ""; 
		this.loadQueryHistory();
	}

}
