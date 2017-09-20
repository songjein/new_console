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
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({name: 'attachQmark'})
export class AttachQMarkPipe implements PipeTransform {
  transform(value, args:string[]) : any {
		if (!value)
			return value;

		// array of string
		if (value.constructor.toString().indexOf("Array") != -1){
			for (let i = 0 ; i < value.length; i ++){
				if (typeof(value[i]) == "string" && value[i].indexOf("\"") == -1)
					value[i] = "\"" + value[i] + "\"";
			}	
			return value;
		}

		// plain string
		if (typeof(value) == "string")
			return "\"" + value + "\"";

		return value;
  }
}
