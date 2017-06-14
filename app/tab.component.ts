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

import { Router } from '@angular/router';

import { Globals } from './globals';

import { TabMenuModule, MenuItem } from 'primeng/primeng';

/**
 * tab component
 */
@Component({
	moduleId: module.id,
	selector: 'tab-menu',
	template: `
		<p-tabMenu [model]="items" [activeItem]="activeItem"></p-tabMenu>
	`,
	styles: [`
	`]
})

export class TabMenuComponent implements OnInit, OnDestroy {
	private items: MenuItem[];
	private activeItem: MenuItem;

	intervalId: any;

	constructor(
		private globals: Globals,
		private router: Router,
	){}

	/**
	 * target router-link when tab-item is clicked 
	 */
	ngOnInit() {
		this.items = [
			{ 
				label: 'Browse', 
				icon: 'fa-table',  
				routerLink: ['/proxy/browse'],
				command: (e) => {
					this.globals.selectedTab = "browse"
				}
			},
			{ 
				label: 'DataType', 
				icon: 'fa-info-circle',
				routerLink: ['/proxy/datatype'],
				command: (e) => {
					this.globals.selectedTab = "datatype"
				}
			},
			{ 
				label: 'Query', 
				icon: 'fa-terminal',
				routerLink: ['/proxy/query'],
				command: (e) => {
					this.globals.selectedTab = "query"
				}
			}
		];

		// for synchronizing between active-tab and routed component
		this.intervalId = setInterval(() => {
			if (this.router.url == "/browse")
				this.activeItem = this.items[0] 
			else if (this.router.url == "/datatype")
				this.activeItem = this.items[1] 
			else if (this.router.url == "/query")
				this.activeItem = this.items[2] 
		}, 300)
	}

	/**
	 * clear intervalId that was used for synchronizing
	 */
	ngOnDestroy(): void {
		clearInterval(this.intervalId);
	}
}
