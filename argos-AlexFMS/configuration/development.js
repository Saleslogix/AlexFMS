define('configuration/AlexFMS/development', ['configuration/development', 'AlexFMS/ApplicationModule'], function(baseDevConfig, FMSModule) {
    return mergeConfiguration(baseDevConfig, {
    	modules: [
    	    new FMSModule()
    	]
    });
});