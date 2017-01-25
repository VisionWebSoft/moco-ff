'use strict';
//modules
const fs=require('fs');
const path=require('path');
require('../shared/js/mr.freeze.js');
//logic
require('./js/config.js');
require('./js/input.js');
require('./js/logic.js');
require('./js/output.js');
output.newDatabase(__dirname);