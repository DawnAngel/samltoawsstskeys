// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var defaultStorage = {
  Activated: true,
  AccessKeyId: '',
  SecretAccessKey: '',
  SessionToken: '',
};

// On load of popup
window.onload = function() {
  // On load of the popup screen check in Chrome's storage if the
  // 'SAML to AWS STS Keys' function is in a activated state or not.
  // Default value is 'activated'
  chrome.storage.sync.get(defaultStorage, function(items) {
    document.getElementById('chkboxactivated').checked = items.Activated;
    document.getElementById('aws_access_key_id').innerHTML = items.AccessKeyId;
    document.getElementById('aws_secret_access_key').innerHTML = items.SecretAccessKey;
    document.getElementById('aws_session_token').innerHTML = items.SessionToken;
  });

  // Add event handler to checkbox
  document.getElementById('chkboxactivated').addEventListener('change', chkboxActivatedChangeHandler);
  document.getElementById('btndownloadcredentials').onclick = btnDownloadCredentials;
};

function chkboxActivatedChangeHandler(event) {
  var checkbox = event.target;
  // Save checkbox state to chrome.storage
  chrome.storage.sync.get(defaultStorage, function(items) {
    items.Activated = checkbox.checked;
    chrome.storage.sync.set(items);
  });
  // Default action for background process
  var action = "removeWebRequestEventListener";
  // If the checkbox is checked, an EventListener needs to be started for
  // webRequests to signin.aws.amazon.com in the background process
  if (checkbox.checked) {
    action = "addWebRequestEventListener";
  }
  chrome.runtime.sendMessage({action: action}, function(response) {
    console.log(response.message);
  });
}

function btnDownloadCredentials(event) {
  console.log('click');
  // On succesful API response create file with the STS keys
  var docContent = "[default] \n" +
  "aws_access_key_id = " + document.getElementById('aws_access_key_id').innerHTML + " \n" +
  "aws_secret_access_key = " + document.getElementById('aws_secret_access_key').innerHTML + " \n" +
  "aws_session_token = " + document.getElementById('aws_session_token').innerHTML;
  var doc = URL.createObjectURL( new Blob([docContent], {type: 'application/octet-binary'}) );
  // Triggers download of the generated file
  chrome.downloads.download({ url: doc, filename: 'credentials', conflictAction: 'overwrite', saveAs: true });
}
