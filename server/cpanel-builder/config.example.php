<?php
return [
    'github_owner' => 'Yearbook-enzyme',
    'github_repo' => 'LCARS-Star-Trek-Niagara-Launcher-Theme',
    'github_workflow' => 'build-lcars-icon-pack-apk.yml',
    'github_branch' => 'main',

    'github_token' => 'PUT_GITHUB_TOKEN_HERE',
    'callback_token' => 'PUT_CPANEL_BUILDER_TOKEN_HERE',

    'public_base_url' => 'https://YOUR-DOMAIN-HERE/lcars-builder',

    'allowed_origins' => [
        'https://yearbook-enzyme.github.io',
        'https://YOUR-DOMAIN-HERE'
    ],

    'max_apps' => 1000
];
