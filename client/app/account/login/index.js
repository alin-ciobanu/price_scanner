'use strict';

import LoginController from './login.controller';

export default angular.module('priceScannerApp.login', [])
  .controller('LoginController', LoginController)
  .name;
