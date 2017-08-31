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
import { Component } from '@angular/core';

import { Globals } from './globals';

/**
 * navbar component
 * shows selected dataverse & dataset
 */
@Component({
	moduleId: module.id,
	selector: 'navbar',
	template: `
		<nav>
			<!--<a href="/"><img src="queryconsoleui/images/asterixdb_tm.png"></a>-->
			<a href="/"><img src="/images/asterixdb_tm.png"></a>
			<strong>AsterixDB Query Web Interface</strong>

			<strong *ngIf="globals.selectedDataverse" class="current-location">
				(
				{{globals.selectedDataverse}} 
				<span *ngIf="globals.selectedDataset"> 
					<span>/</span> 
					<span style="color:red;">{{globals.selectedDataset}}</span>
				</span>
				)
			</strong>
		</nav>

	`,
	styleUrls: ['navbar.component.css']
})

export class NavbarComponent {

	constructor(
		private globals: Globals		
	){}
}
