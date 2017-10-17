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
import { Component, OnInit, Input } from '@angular/core'; 
import { DataTableModule, SharedModule, ButtonModule, ToggleButtonModule } from 'primeng/primeng'; 
import { SelectItem } from 'primeng/primeng';
import { QueryService } from './query.service'; 
import { Globals } from './globals';

/*
 * Browse component 
 * show data of given dataverse and dataset
 */
@Component({
	moduleId: module.id,
	selector: 'browse-tab',
	templateUrl: 'browse.component.html',
	styleUrls: ['browse.component.css']
})

export class BrowseComponent implements OnInit {

	/**
	 * query component reuse this component and will input user typed query
	 */
	@Input() query: string;
	@Input() isReused: boolean;
	
	/**
	 * view type
	 */
	types: SelectItem[];
	selectedType: string = "Table";

	/**
	 * data, cols will be injected to the table 
	 */ 
	allData: any[];
	data: any[];
	cols: any[] = [];
	colsfilters: SelectItem[] = [];

	/**
	 * column filter checkbox
	 */
	selectedColumns: string[] = [];

	/**
	 * query result message
	 */
	execution_time: number;
	status: string;
	errors: string[] = [];

	/**
	 * expansion status
	 */
	expansions: any[] = Array(25); // must be the same with the number of rows in a page (this.limit)
	expanded: boolean = false;
	lastSelectedColumn: number;
	firstFetched: boolean;
	clickedColumn: string;

	/**
	 * data fetch offset
	 */
	offset: number = 0;
	limit: number = 25; // maximum rows in one page
	limits: SelectItem[]; // List for limit option
	fetchPageNum: number = 10; // size of fetching data = limit * fetchPageNum
	currentPageNum: number = 1;
	pages: number[] = [];
	chunkNum: number = 1;
	isLoading: boolean = false;

	constructor(
		private globals: Globals,
		private queryService: QueryService
	) { 
		this.types = [];	
		this.types.push({label: "Table", value: "Table"});
		this.types.push({label: "JSON", value: "JSON"});
		this.types.push({label: "Tree", value: "Tree"});

		this.limits = [];
		this.limits.push({label: "25", value: 25});
		this.limits.push({label: "50", value: 50});
		this.limits.push({label: "100", value: 100});
	}
	
	/**
	 * get chunk from the database 
	 * TODO : add limit offset to the user typed query 
	 */
	getChunk(offset: number): void {
		if (!this.firstFetched) this.cols = [];

		const dvName = this.globals.selectedDataverse;
		const dsName = this.globals.selectedDataset;

		let query = "";
		if (this.query){
			// REUSE mode in query component
			this.errors = []; 
			this.status = undefined; 
			query = this.query;
		}
		else {
			// DEFAULT mode in browse component
			if ((!dvName || !dsName)) return;
			query =`
						USE ${dvName};
						SELECT VALUE ds FROM \`${dsName}\` ds
						LIMIT ${this.limit * this.fetchPageNum} OFFSET ${offset};
					`;
		}

		this.isLoading = true;

		this.queryService
			.sendQuery(
				query
			)
			.then(res => {
				res = JSON.parse(res);
				if ("results" in res){
					const records = res.results;
					this.allData = [];
					this.allData = records;
					
					// Columns filter
					this.colsfilter = [];

					// look up the number/2 of rows data and build columns
					// make maximum length columns
					if (!this.firstFetched){
						for (let i = 0 ; i < records.length / 2; i++){
							const keys = Object.keys(records[i]);	
							for (let j = 0 ; j < keys.length; j++){
								if (!this.cols.includes(keys[j])) {
									this.cols.push(keys[j]);	
									this.selectedColumns.push(keys[j]);	

									this.colsfilter.push({label: keys[j], value: keys[j]});
								}
							}
						}
					}
					// make empty key (null value) for nullable data 
					for (let i = 0 ; i < this.allData.length; i++){
						for (let j = 0 ; j < this.cols.length; j++){
							if (!(this.cols[j] in this.allData[i])){
								this.allData[i][this.cols[j]] = "";	
							}
						}	
					}

					// data for the first page in the chunk
					this.getPageData(1 + (this.chunkNum - 1) * 10);
					
					// generate page number
					this.pages = [];
					for (let i = 0 ; i < this.allData.length / this.limit; i++){
						this.pages.push(i + 1 + ((this.chunkNum-1) * this.fetchPageNum));
					}

					// use this flag to make columns only when we get the first chunk
					if (!this.firstFetched) this.firstFetched = true;
				}

				if ("errors" in res){
					for (let i = 0; i < res["errors"].length; i++)
						this.errors.push(res["errors"][i]["msg"]);
				}
				this.execution_time = res.metrics.executionTime;
				this.status = res.status;

				this.isLoading = false;
			});
	}

	/**
	 * when click the page number, slice this.allData into this.data
	 */
	getPageData(pageNum: number){
		// change page when the all items are expanded => refresh expanded area
		if (this.expanded){
			this.expandAll(this.lastSelectedColumn, true);	
		}

		this.data = []
		pageNum = pageNum - ((this.chunkNum - 1) * this.fetchPageNum);
		const offset = this.limit * (pageNum - 1);
		const limit = offset + this.limit;
		this.data = this.allData.slice(offset, limit);
	}

	/**
	 * when click the next page button, get the next chunk from the database
	 */
	getNextChunk(){
		this.getChunk(this.limit * this.chunkNum * this.fetchPageNum);
		this.chunkNum ++;
	}

	/**
	 * when click the prev page button, get the previous chunk from the database
	 */
	getPrevChunk(){
		this.getChunk(this.limit * (this.chunkNum - 2) * this.fetchPageNum);
		this.chunkNum --;
	}

	/**
	 * click cell
	 * row : selected row index
	 * col : selected col index
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
			this.clickedColumn = "";
			return;
		}

		this.expansions[row] = clickedData[clickedColumn];
		this.clickedColumn = clickedColumn;
	}

	/**
	 * expand all
	 * col : selected column
	 * changePage : if user change page after expanding all items, use this value for refresh expanded area
	 */
	expandAll(col: string, changePage: boolean): void{
		// if already expanded
		if (!changePage && this.expanded){
			// make expansions array empty 	
			for (let i = 0 ; i < this.data.length; i++){
				this.expansions[i] = null;
			}
			this.expanded= false;
			this.clickedColumn = "";
			return;	
		}

		this.clickedColumn = col;
		
		// will be used move page when expanded all, to refresh expended area
		this.lastSelectedColumn = col;

		// expand all
		this.expanded= true;
		for (let i = 0 ; i < this.data.length; i++){
			this.expansions[i] = this.data[i][col];
		}
	}

	updateBrowseComponent(dvName: any, dsNames: any){
		this.cols = [];
		this.selectedColumns = [];
		this.offset = 0;
		this.firstFetched = false;
		this.getChunk(this.offset);
		this.globals.buildSpecialCasePairs(dvName, dsNames);
	}

	onChangeLimit() {
		this.updateBrowseComponent(this.globals.selectedDataverse, [this.globals.selectedDataset]);
	}

  /**
	 * call getChunk() when this component loaded
	 */
	ngOnInit(): void {
		if (!this.isReused){
			this.updateBrowseComponent(this.globals.selectedDataverse, [this.globals.selectedDataset]);
		}
	}
}
