<?php

/*
	Question2Answer (c) Gideon Greenspan

	http://www.question2answer.org/

	
	File: qa-include/qa-app-blobs.php
	Version: See define()s at top of qa-include/qa-base.php
	Description: Application-level blob-management functions


	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation; either version 2
	of the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	More about this license: http://www.question2answer.org/license.php
*/

	if (!defined('QA_VERSION')) { // don't allow this page to be requested directly from browser
		header('Location: ../');
		exit;
	}

	
	function qa_get_blob_url($blobid, $absolute=false)
/*
	Return the URL which will output $blobid from the database when requested, $absolute or relative
*/
	{
		if (qa_to_override(__FUNCTION__)) { $args=func_get_args(); return qa_call_override(__FUNCTION__, $args); }
		
		return qa_path('blob', array('qa_blobid' => $blobid), $absolute ? qa_opt('site_url') : null, QA_URL_FORMAT_PARAMS);
	}
	
	
	function qa_get_max_upload_size()
/*
	Return the maximum size of file that can be uploaded, based on database and PHP limits
*/
	{
		if (qa_to_override(__FUNCTION__)) { $args=func_get_args(); return qa_call_override(__FUNCTION__, $args); }
		
		$mindb=16777215; // from MEDIUMBLOB column type
		
		$minphp=trim(ini_get('upload_max_filesize'));
		
		switch (strtolower(substr($minphp, -1))) {
			case 'g':
				$minphp*=1024;
			case 'm':
				$minphp*=1024;
			case 'k':
				$minphp*=1024;
		}
		
		return min($mindb, $minphp);
	}
	
	
	function qa_get_blob_directory($blobid)
	{
		return rtrim(QA_BLOBS_DIRECTORY, '/').'/'.substr(str_pad($blobid, 20, '0', STR_PAD_LEFT), 0, 3);
	}
	
	
	function qa_get_blob_filename($blobid, $format)
	{
		return qa_get_blob_directory($blobid).'/'.$blobid.'.'.preg_replace('/[^A-Za-z0-9]/', '', $format);
	}
	
	
	function qa_create_blob($content, $format, $sourcefilename=null, $userid=null, $cookieid=null, $ip=null)
	{
		if (qa_to_override(__FUNCTION__)) { $args=func_get_args(); return qa_call_override(__FUNCTION__, $args); }
		
		require_once QA_INCLUDE_DIR.'qa-db-blobs.php';
		
		$blobid=qa_db_blob_create(defined('QA_BLOBS_DIRECTORY') ? null : $content,
			$format, $sourcefilename, $userid, $cookieid, $ip);

		if (defined('QA_BLOBS_DIRECTORY')) {
			$diskwritten=false;
			
			$directory=qa_get_blob_directory($blobid);
			if (is_dir($directory) || mkdir($directory, fileperms(rtrim(QA_BLOBS_DIRECTORY, '/')) & 0777)) {
				$filename=qa_get_blob_filename($blobid, $format);
				
				$file=fopen($filename, 'xb');
				if (is_resource($file)) {
					if (fwrite($file, $content)>=strlen($content))
						$diskwritten=true;

					fclose($file);
					
					if (!$diskwritten)
						unlink($filename);
				}
			}
			
			if (!$diskwritten) // still write to database if writing to disk failed
				qa_db_blob_set_content($blobid, $content);	
		}
	
		return $blobid;
	}
	
	
	function qa_read_blob($blobid)
	{
		if (qa_to_override(__FUNCTION__)) { $args=func_get_args(); return qa_call_override(__FUNCTION__, $args); }
		
		require_once QA_INCLUDE_DIR.'qa-db-blobs.php';
	
		$blob=qa_db_blob_read($blobid);
		
		if (defined('QA_BLOBS_DIRECTORY') && !isset($blob['content']))
			$blob['content']=file_get_contents(qa_get_blob_filename($blobid, $blob['format']));
		
		return $blob;
	}
	
	
	function qa_delete_blob($blobid)
	{
		if (qa_to_override(__FUNCTION__)) { $args=func_get_args(); return qa_call_override(__FUNCTION__, $args); }
		
		require_once QA_INCLUDE_DIR.'qa-db-blobs.php';
	
		if (defined('QA_BLOBS_DIRECTORY')) {
			$blob=qa_db_blob_read($blobid);
			
			if (isset($blob) && !isset($blob['content']))
				unlink(qa_get_blob_filename($blobid, $blob['format']));
		}
		
		qa_db_blob_delete($blobid);
	}
	

/*
	Omit PHP closing tag to help avoid accidental output
*/