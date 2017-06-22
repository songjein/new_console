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
	 * data, cols will be injected to the table 
	 */ 
	allData: any[];
	data: any[];
	cols: any[] = [];

	/**
	 * column filter checkbox
	 */
	selectedColumns: string[] = [];

	/**
	 * expansion status
	 */
	expansions: any[] = Array(25); // must be the same with the number of rows in a page
	expanded: boolean = false;
	lastSelectedColumn: number;
	firstFetched: boolean;

	/**
	 * data fetch offset
	 */
	offset: number = 0;
	limit: number = 25; // maximum rows in one page
	fetchPageNum: number = 10; // size of fetching data = limit * fetchPageNum
	currentPageNum: number = 1;
	pages: number[] = [];
	chunkNum: number = 1;
	isLoading: boolean = false;

	constructor(
		private globals: Globals,
		private queryService: QueryService
	) { }
	
	/**
	 * get chunk from the database 
	 */
	getChunk(offset: number): void {
		if (!this.firstFetched) this.cols = [];

		const dvName = this.globals.selectedDataverse;
		const dsName = this.globals.selectedDataset;

		if (!dvName || !dsName) return;

		this.isLoading = true;

		this.queryService
			.sendQuery(
				`
					USE ${dvName};
					SELECT VALUE ds FROM \`${dsName}\` ds
					LIMIT ${this.limit * this.fetchPageNum} OFFSET ${offset};
				`
			)
			.then(res => {
				const records = JSON.parse(res).results;
				this.allData = [];
				this.allData = records;

				// look up the number/2 of rows data and build columns
				// make maximum length columns
				if (!this.firstFetched){
					for (let i = 0 ; i < records.length / 2; i++){
						const keys = Object.keys(records[i]);	
						for (let j = 0 ; j < keys.length; j++){
							if (!this.cols.includes(keys[j])) {
								this.cols.push(keys[j]);	
								this.selectedColumns.push(keys[j]);	
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

				// data for the first page
				this.data = this.allData.slice(0, this.limit);
				
				// generate page number
				this.pages = [];
				for (let i = 0 ; i < this.fetchPageNum; i++){
					this.pages.push(i + 1 + ((this.chunkNum-1) * this.fetchPageNum));
				}

				// use this flag to make columns only when we get the first chunk
				if (!this.firstFetched) this.firstFetched = true;

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
			return;
		}

		this.expansions[row] = clickedData[clickedColumn];
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
			return;	
		}
		
		// will be used move page when expanded all, to refresh expended area
		this.lastSelectedColumn = col;

		// expand all
		this.expanded= true;
		for (let i = 0 ; i < this.data.length; i++){
			this.expansions[i] = this.data[i][col];
		}
	}

  /**
	 * call getChunk() when this component loaded
	 */
	ngOnInit(): void {
		this.firstFetched = false;
		this.getChunk(this.offset);
	}
}
