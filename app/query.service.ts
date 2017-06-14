import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/toPromise';

/**
 * query service
 * send query parameter to the database 
 * and return the result
 */
@Injectable()
export class QueryService {

	constructor (private http: Http) { }

	private headers = new Headers({'Content-Type': 'application/json'});

	/**
	 * send query to the server 
	 */
	sendQuery(query: string): Promise<any> {
		const apiUrl = '/query/service';

		return this.http
			.post(apiUrl, JSON.stringify({statement: query}), {headers: this.headers})
			.toPromise()
			.then(response => {
					// should remove JSON.parse with servlet
					return JSON.parse(response._body);
				})
			.catch(this.handleError);
	} 
	private handleError(error: any): Promise<any> {
		return Promise.reject(error.message || error);
	}

}

