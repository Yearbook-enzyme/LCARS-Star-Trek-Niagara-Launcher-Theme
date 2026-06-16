# LCARS cPanel Builder Backend

Upload this folder to cPanel as public_html/lcars-builder/.

Copy config.example.php to config.php on the server and fill in real secrets.

Do not commit config.php.

Public endpoints:
- build.php
- status.php
- download.php

GitHub callback endpoints:
- job.php
- status-update.php
- upload.php
