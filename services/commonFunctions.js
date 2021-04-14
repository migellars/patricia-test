function formatter(stringData, dataObject) {
    let keyArray = Object.keys(dataObject);
    let valueArray = Object.values(dataObject);

    let newString = stringData;
    keyArray.forEach(function (element, index) {
        let text = new RegExp("\\$" + element + "\\$", "g");
        newString = newString.replace(text, valueArray[index]);
    });
    return newString;
};

function transformMobile(mobile) {
    let newMobile = ""
    if (mobile.startsWith("0")) {
        newMobile = "+234" + mobile.substring(1, 11);
    } else if (mobile.startsWith("+234")) {
        newMobile = mobile;
    } else if (mobile.startsWith("234") && mobile.length == 13) {
        newMobile = "+" + mobile;
    } else if (mobile.length == 10) {
        newMobile = "+234" + mobile;
    }
    return newMobile;
};

function getStartOfDay() {
    let sign = "+";
    let offsetHour = 1;
    let offsetMin = 0
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);  //This converts to UTC 00:00
    var nd;
    if (sign == "+") {
        nd = new Date(utc + (3600000 * offsetHour) + (60000 * offsetMin));
    } else {
        nd = new Date(utc - (3600000 * offsetHour) - (60000 * offsetMin));
    }
    let options = { day: 'numeric' };
    let day = nd.toLocaleDateString(undefined, options)
    if (day < 10) day = "0" + day;
    options = { month: 'numeric' };
    let month = nd.toLocaleDateString(undefined, options)
    if (month < 10) month = "0" + month;
    options = { year: 'numeric' };
    let year = nd.toLocaleDateString(undefined, options)
    let currentDate = year + "-" + month + "-" + day;
    let currDateString = currentDate + "T00:00:00.000" + "+01:00";
    let currStartTime = Math.round(new Date(currDateString).getTime() / 1000);

    return { currStartTime, currentDate }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


module.exports.formatter = formatter;
module.exports.transformMobile = transformMobile;
module.exports.getStartOfDay = getStartOfDay;
module.exports.isEmpty = isEmpty;