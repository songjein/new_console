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
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PanelMenuModule,MenuItem } from 'primeng/primeng';

import { QueryService } from './query.service'; 
import { Globals } from './globals';

/**
 * sidebar component
 */ 
@Component({
	moduleId: module.id,
	selector: 'sidebar', 
	templateUrl: 'sidebar.component.html',
	styles:[`
	`]
})

export class SidebarComponent implements OnInit{
	
	/**
	 * menu items
	 */
	items: MenuItem[] = [];

	constructor(
		private router: Router,
		private globals: Globals,
		private queryService: QueryService	
	){}

	/**
	 * get all dataverses in the database
	 */
	getDataverse(): void {
		this.queryService
			.sendQuery("SELECT VALUE dv FROM Metadata.`Dataverse` dv")
			.then(res => {
				// parse response body
				const dv = JSON.parse(res).results;
				for (var i = 0; i < dv.length; i++){
					if (dv[i]["DataverseName"] == "Default") continue;
					this.items.push(
						{ 
							label: dv[i]["DataverseName"], 
							icon: '', 
							items: [],
							command: (e) => {
								this.globals.selectedDataset = null;
								this.globals.selectedDataverse = e.item.label;	
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
			.sendQuery("SELECT VALUE ds FROM Metadata.`Dataset` ds")
			.then(res => {
				// parse response body
				const ds = JSON.parse(res).results;
				for (var i = 0; i < ds.length; i++){
					const dvName = ds[i]["DataverseName"];
					const dsName = ds[i]["DatasetName"];

					const idx = this.items.findIndex(x => x["label"] == dvName);

					this.items[idx]["items"].push(
						{ 
							label: dsName, 
							icon: '', 
							command: (e) => {
								this.globals.selectedDataverse = dvName;	
								this.globals.selectedDataset = e.item.label;

								// navigate through the proxy component
								// for the component in router-outlet refreshing
								// /proxy/:routed-component
								if (this.globals.selectedTab == "browse")
									this.router.navigate(['/proxy/browse']);
								else if (this.globals.selectedTab == "datatype")
									this.router.navigate(['/proxy/datatype']);
								else
									this.router.navigate(['/proxy/browse']);
							}
						}
					);
				}

			});
	}

	/**
	 * call getDataverse() when component is loaded
	 */
	ngOnInit(): void {
		this.getDataverse();
	}
}
