import { Component, OnInit, Input }		from '@angular/core';
import { QueryService } 							from './query.service';
import { Globals } 										from './globals';

/*
 * CreateDV Component
 * 
 */
@Component({
	moduleId: module.id,
	selector: 'createdv',
	templateUrl: 'createdv.component.html',
	styleUrls: ['createdv.component.css']
})

export class CreateDVComponent implements OnInit {

	newDvName: string; 			// New dataverse name to create

	// query result message
	execution_time: number;
	status: string;
	errors: string[] = [];

	constructor(
		private globals: Globals,
		private queryService: QueryService
	) {}

	/**
	 * createDataverse()
	 * - Create new dataverse
	 */
	createDataverse() {
		const _dvName = this.newDvName;

		this.queryService
			.sendQuery(
				`
					CREATE  DATAVERSE ${_dvName};
				`
			)
			.then(res => {
				res = JSON.parse(res);
				if ("errors" in res) {
					for (let i = 0; i < res["errors"].length; i++)
						this.errors.push(res["errors"][i]["msg"]);
				}

				if ("results" in res) {
				}

				this.execution_time = res.metrics.executionTime;
				this.status = res.status;
				
				// update sidebar
				this.globals.updateSidebar();
			})
		);
	}

	ngOnInit(): void {
	}
}
