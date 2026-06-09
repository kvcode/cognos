(function () {
  var cb = window.__oauthCallback;
  var p = JSON.parse(atob(cb.state));
  document.getElementById("title").textContent = "Exchanging token...";
  var body = [
    "grant_type=authorization_code",
    "client_id=" + encodeURIComponent(p.clientId),
    "code=" + encodeURIComponent(cb.code),
    "redirect_uri=" + encodeURIComponent(p.redirectUri),
    "code_verifier=" + encodeURIComponent(p.codeVerifier),
  ].join("&");
  fetch(p.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body,
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (j) {
      console.log("[DEBUG TOKEN]", j);
      document.getElementById("title").textContent = j.access_token ? "Token OK!" : "Failed";
      document.getElementById("msg").textContent = JSON.stringify(j, null, 2);
      if (j.access_token && window.opener) {
        window.opener.postMessage(j, "*");
        setTimeout(function () {
          window.close();
        }, 3000);
      }
    })
    .catch(function (e) {
      document.getElementById("title").textContent = "Error";
      document.getElementById("msg").textContent = e.message;
    });
})();
