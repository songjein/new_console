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

/**
 * Root component
 * Defines our application's layout
 */
@Component({
	selector: 'query-console',
	template: `
		<navbar></navbar>
		<div id="left-div" >
			<div id="left-div-label">Dataverse</div>
			<sidebar></sidebar>
		</div>
		<div id="right-div">
			<tab-menu></tab-menu>
			<div style="height:3px;"></div>
			<router-outlet></router-outlet>
		</div>
	`,
	styles: [`
		#left-div{
			max-width:200px; 
			min-width:150px; 
			float:left; 
			padding: 30px 10px;;
		}
		#left-div-label{
			font-weight:bold;
			font-size:1.3em;
			margin-bottom:5px;
		}
		#right-div{
			width: 85%; 
			float:left; 
			overflow:auto; 
			padding: 10px; 
		}
		
		@media (max-width: 1000px) {
			#left-div-label{
				color:red;
			}
			#right-div{
				width:97%;				
			}
		}
	`]
})

export class AppComponent {
}
