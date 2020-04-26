import time
from huey import crontab
from huey.contrib.djhuey import periodic_task, task, db_task

@task()
def count_beans(number):
    time.sleep(8)
    print('-- counted %s beans --' % number)
    return 'Counted %s beans' % number
