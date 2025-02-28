
function tsToDate(timestamp, type) {

    let MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dateFormat = new Date(parseInt(timestamp) * 1000);

    let d = dateFormat.getDate();
    let m = dateFormat.getMonth() + 1;
    let M = MONTHS[dateFormat.getMonth()];
    let Y = dateFormat.getFullYear();
    let h = dateFormat.getHours() % 12 ? dateFormat.getHours() % 12 : 12;
    let i = dateFormat.getMinutes();
    let A = dateFormat.getHours() > 12 ? "PM" : "AM";
    let s = dateFormat.getSeconds();

    d = d < 10 ? "0" + d : d;
    m = m < 10 ? "0" + m : m;
    h = h < 10 ? "0" + h : h;
    i = i < 10 ? "0" + i : i;
    s = s < 10 ? "0" + s : s;
    if (type === 'd M Y') {
        return d + " " + M + " " + Y;
    } else if (type === 'd-m-Y') {
        return d + "-" + m + "-" + Y;
    } else if (type === 'd-m-Y h:i A') {
        return d + "-" + m + "-" + Y + " " + h + ":" + i + " " + A;
    } else if (type === 'h:i A') {
        return h + ":" + i + " " + A;
    } else if (type === 'h:i:s') {
        return h + ":" + i + ":" + s;
    } else {
        return d + "/" + M + "/" + Y + " " + h + ":" + i + ":" + s + " " + A;
    }
}

function secFormat(seconds, type) {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

function ReadyHTMLForWebView(desc) {
    return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head><body>" + desc + "</body></html>"
}

export default {
    tsToDate,
    secFormat,
    ReadyHTMLForWebView
}