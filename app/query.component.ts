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

	// typed query
	query: string; 

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
	}

	sendQuery(){
		this.addQueryHistory(this.query);
		this.qhCursor = this.queryHistory.length;

		const dvds = this.extractDvDsName(this.query);
		this.child.updateBrowseComponent(dvds.dvName, dvds.dsNames);
	}
	

	// TODO: need to be moved to the browse component
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
