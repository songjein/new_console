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

	/**
	 * send query to the server 
	 */
	sendQuery(query: string): Promise<any> {
		const apiUrl = '/query/service'; 

		return this.http
			.post(apiUrl, {statement: query})
			.toPromise()
			.then(response => {
				// when user typed query has error, response._body = "" -> why?
				// why is there no error message in the response._body?
				if (response._body == "") 
					return response._body;
				return JSON.parse(response._body);
				})
			.catch(this.handleError);
	}

	private handleError(error: any): Promise<any> {
		return Promise.reject(error.message || error);
	}

}

