define('configuration/AlexFMS/production', ['configuration/production', 'AlexFMS/ApplicationModule'], function(baseDevConfig, FMSModule) {
    return mergeConfiguration(baseDevConfig, {
    	modules: [
    	    new FMSModule()
    	]
    });
});