# Introduction
A global error handler.

```javascript
// these two are global unhandled errors
window.onerror = function (msg, url, line, col, error) {
  //  console.log("on error:", error)
  message.showError(msg + "," + error?.message);
  //code to handle or report error goes here
};
// event:{reason:"message thrown"}
window.addEventListener("unhandledrejection", function (event) {
  const err = event.reason;
  if (err) {
    message.showError(err.message);
  }
  //handle error here
  //event.promise contains the promise object
  //event.reason contains the reason for the rejection
});
```