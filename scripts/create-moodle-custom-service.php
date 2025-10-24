<?php
/**
 * Create Custom Moodle Web Service
 * This script creates a custom web service with proper permissions for MediVerse
 */

// Moodle configuration
define('CLI_SCRIPT', true);
require_once('/var/www/html/config.php');

echo "🔧 Creating Custom Moodle Web Service for MediVerse...\n";

try {
    // Create custom service
    $service = new stdClass();
    $service->name = 'MediVerse API';
    $service->shortname = 'mediverse_api';
    $service->enabled = 1;
    $service->restrictedusers = 0;
    $service->component = '';
    $service->timecreated = time();
    $service->timemodified = time();
    
    $serviceid = $DB->insert_record('external_services', $service);
    echo "✅ Created service: MediVerse API (ID: $serviceid)\n";
    
    // Add required functions to the service
    $functions = [
        'core_user_create_users',
        'core_user_get_users_by_field', 
        'core_user_create_user_key',
        'core_webservice_get_site_info',
        'core_user_update_users',
        'core_user_delete_users'
    ];
    
    foreach ($functions as $function) {
        $function_record = $DB->get_record('external_functions', ['name' => $function]);
        if ($function_record) {
            $service_function = new stdClass();
            $service_function->externalserviceid = $serviceid;
            $service_function->functionname = $function;
            
            $DB->insert_record('external_services_functions', $service_function);
            echo "✅ Added function: $function\n";
        } else {
            echo "⚠️ Function not found: $function\n";
        }
    }
    
    // Create service token for admin user
    $admin_user = $DB->get_record('user', ['username' => 'admin']);
    if ($admin_user) {
        $token = new stdClass();
        $token->token = 'mediverse_' . bin2hex(random_bytes(16));
        $token->tokentype = EXTERNAL_TOKEN_PERMANENT;
        $token->userid = $admin_user->id;
        $token->externalserviceid = $serviceid;
        $token->contextid = context_system::instance()->id;
        $token->creatorid = $admin_user->id;
        $token->timecreated = time();
        $token->lastaccess = null;
        
        $tokenid = $DB->insert_record('external_tokens', $token);
        echo "✅ Created service token: {$token->token}\n";
        echo "📋 Token ID: $tokenid\n";
        echo "📋 Service ID: $serviceid\n";
        
        // Save token to file for backend use
        file_put_contents('/tmp/mediverse_token.txt', $token->token);
        echo "💾 Token saved to /tmp/mediverse_token.txt\n";
    }
    
    echo "\n🎉 Custom web service created successfully!\n";
    echo "📋 Service Name: MediVerse API\n";
    echo "📋 Service Shortname: mediverse_api\n";
    echo "📋 Token: {$token->token}\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
