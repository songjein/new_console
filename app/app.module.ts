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
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { 
	PanelMenuModule, 
	TabMenuModule, 
	DataTableModule, 
	SharedModule, 
	MenuItem,
	ButtonModule,
	ToggleButtonModule,
	RadioButtonModule,
	CheckboxModule,
	SelectButtonModule,	
	PanelModule,
	InputTextModule,
	DropdownModule,
	ListboxModule,
	MultiSelectModule,
} from 'primeng/primeng';

import { CodemirrorComponent } from './codemirror.component';

import { PrettyJsonModule } from 'angular2-prettyjson';

import { Globals }  from './globals';

import { AppComponent }  from './app.component';
import { NavbarComponent }  from './navbar.component';
import { SidebarComponent }  from './sidebar.component';
import { TabMenuComponent }  from './tab.component';
import { BrowseComponent } 	 from './browse.component';
import { QueryComponent } 	 from './query.component'; 
import { DatatypeComponent } 	 from './datatype.component'; 
import { ProxyComponent } 	 from './proxy.component';
import { CreateDVComponent }			 from './createdv.component';
import { CreateDSComponent }			 from './createds.component';
import { CreateDTComponent }			 from './createdt.component';
import { DropComponent }			 from './drop.component';

import { QueryService } from './query.service';

import { routing } from './routes';

import { KeysPipe } from './keys.pipe';
import { ObjectTypePipe } from './objecttype.pipe';
import { ObjectArrayTypePipe } from './objectarraytype.pipe';
import { AttachQMarkPipe } from './attachQMark.pipe';

@NgModule({
  imports: [ 
		BrowserModule, 
		FormsModule,
		HttpModule,
		PanelMenuModule,
		routing,
		TabMenuModule,
		DataTableModule,
		SharedModule,
		ButtonModule,
		PrettyJsonModule,
		ToggleButtonModule,
		RadioButtonModule,
		CheckboxModule,
		SelectButtonModule,	
		PanelModule,
		InputTextModule,
		DropdownModule,
		ListboxModule,
		MultiSelectModule,
	],

  declarations: [
		AppComponent, 
		ProxyComponent,
		NavbarComponent,
		SidebarComponent,
		TabMenuComponent,
		BrowseComponent,
		QueryComponent,
		DatatypeComponent,
		CodemirrorComponent,
		KeysPipe,
		ObjectTypePipe,
		ObjectArrayTypePipe,
		AttachQMarkPipe,
		CreateDVComponent,
		CreateDSComponent,
		CreateDTComponent,
		DropComponent,
	],

	/**
	* a singleton service instances
	*/
	providers: [
		QueryService,
		Globals
	],
	
  bootstrap: [ AppComponent ]
})

export class AppModule { }
