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
