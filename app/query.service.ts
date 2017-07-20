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
					//return response._body;
					return JSON.parse(response._body);
				})
			.catch(this.handleError);
	} 
	private handleError(error: any): Promise<any> {
		return Promise.reject(error.message || error);
	}

}

