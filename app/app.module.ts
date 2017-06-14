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

import { QueryService } from './query.service';

import { routing } from './routes';

import { KeysPipe } from './keys.pipe';
import { ObjectTypePipe } from './objecttype.pipe';
import { ObjectArrayTypePipe } from './objectarraytype.pipe';

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
