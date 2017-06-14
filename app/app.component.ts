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
