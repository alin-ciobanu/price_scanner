'use strict';

import {
  UtilService
} from './util.service';

export default angular.module('priceScannerApp.util', [])
  .factory('Util', UtilService)
  .name;
