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
import { Route, RouterModule } from '@angular/router';

import { BrowseComponent } from './browse.component';
import { QueryComponent } from './query.component';
import { DatatypeComponent } from './datatype.component';
import { ProxyComponent } from './proxy.component';

/**
 * Define routing information between components
 */
export const routes: Route[] = [
	{ path: '', pathMatch: 'full', component: QueryComponent},
	{ path: 'proxy/:target', component: ProxyComponent},
	{ path: 'browse', component: BrowseComponent },
	{ path: 'datatype', component: DatatypeComponent },
	{ path: 'query', component: QueryComponent }
];

export const routing = RouterModule.forRoot(routes, { useHash: true });
