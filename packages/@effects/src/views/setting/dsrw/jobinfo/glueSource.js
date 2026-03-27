export default {
  // glueSource_java
  'GLUE_GROOVY': `
    package com.xxl.job.service.handler;

    import com.xxl.job.core.context.XxlJobHelper;
    import com.xxl.job.core.handler.IJobHandler;

    public class DemoGlueJobHandler extends IJobHandler {

      @Override
      public void execute() throws Exception {
        XxlJobHelper.log("XXL-JOB, Hello World.");
      }

    }
  `,
  // glueSource_shell
  'GLUE_SHELL': `
    #!/bin/bash
    echo "xxl-job: hello shell"
    
    echo "\$\{I18n.jobinfo_script_location}：$0"
    echo "\$\{I18n.jobinfo_field_executorparam}：$1"
    echo "\$\{I18n.jobinfo_shard_index} = $2"
    echo "\$\{I18n.jobinfo_shard_total} = $3"
    <#--echo "参数数量：$#"
    for param in $*
    do
        echo "参数 : $param"
        sleep 1s
    done-->
    
    echo "Good bye!"
    exit 0
  `,
  // glueSource_python
  'GLUE_PYTHON': `
    #!/usr/bin/python
    # -*- coding: UTF-8 -*-
    import time
    import sys

    print "xxl-job: hello python"

    print "\$\{I18n.jobinfo_script_location}：", sys.argv[0]
    print "\$\{I18n.jobinfo_field_executorparam}：", sys.argv[1]
    print "\$\{I18n.jobinfo_shard_index}：", sys.argv[2]
    print "\$\{I18n.jobinfo_shard_total}：", sys.argv[3]
    <#--for i in range(1, len(sys.argv)):
      time.sleep(1)
      print "参数", i, sys.argv[i]-->

    print "Good bye!"
    exit(0)
    <#--
    import logging
    logging.basicConfig(level=logging.DEBUG)
    logging.info("脚本文件：" + sys.argv[0])
    -->
  `,
  // glueSource_php
  'GLUE_PHP': `
    <?php

      echo "xxl-job: hello php  \n";

      echo "\$\{I18n.jobinfo_script_location}：$argv[0]  \n";
      echo "\$\{I18n.jobinfo_field_executorparam}：$argv[1]  \n";
      echo "\$\{I18n.jobinfo_shard_index} = $argv[2]  \n";
      echo "\$\{I18n.jobinfo_shard_total} = $argv[3]  \n";

      echo "Good bye!  \n";
      exit(0);
    ?>
  `,
  // glueSource_nodejs
  'GLUE_NODEJS': `
    #!/usr/bin/env node
    console.log("xxl-job: hello nodejs")

    var arguments = process.argv

    console.log("\$\{I18n.jobinfo_script_location}: " + arguments[1])
    console.log("\$\{I18n.jobinfo_field_executorparam}: " + arguments[2])
    console.log("\$\{I18n.jobinfo_shard_index}: " + arguments[3])
    console.log("\$\{I18n.jobinfo_shard_total}: " + arguments[4])
    <#--for (var i = 2; i < arguments.length; i++){
      console.log("参数 %s = %s", (i-1), arguments[i]);
    }-->

    console.log("Good bye!")
    process.exit(0)
  `,
  // glueSource_powershell
  'GLUE_POWERSHELL': `
    Write-Host "xxl-job: hello powershell"

    Write-Host "\$\{I18n.jobinfo_script_location}: " $MyInvocation.MyCommand.Definition
    Write-Host "\$\{I18n.jobinfo_field_executorparam}: "
      if ($args.Count -gt 2) { $args[0..($args.Count-3)] }
    Write-Host "\$\{I18n.jobinfo_shard_index}: " $args[$args.Count-2]
    Write-Host "\$\{I18n.jobinfo_shard_total}: " $args[$args.Count-1]

    Write-Host "Good bye!"
    exit 0
  `
}
