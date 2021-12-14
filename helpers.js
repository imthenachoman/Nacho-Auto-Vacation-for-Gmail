function logObject(functionName, objectName, object)
{
    Logger.log(`${functionName}: ${objectName} = ${JSON.stringify(object)}`);
    //Logger.log(`${functionName}: ${objectName} = ${JSON.stringify(object, null, "  ")}`);
}

function logMessage(functionName, message)
{
    Logger.log(`${functionName}: ${message}`);
}