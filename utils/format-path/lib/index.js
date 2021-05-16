'use strict';

const path=require("path")

function formatPath(p) {
   const sep=path.sep
   if(sep==='/'){
    return p

   }else{
       return p.replace(/\\/g,"/")
   }
}

module.exports = formatPath;
