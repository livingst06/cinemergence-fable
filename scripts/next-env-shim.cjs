const Module = require("module");

const originalLoad = Module._load;

Module._load = function (request, parent, isMain) {
  const result = originalLoad.call(this, request, parent, isMain);
  if (request === "@next/env" && result && result.default === undefined) {
    result.default = result;
  }
  return result;
};
