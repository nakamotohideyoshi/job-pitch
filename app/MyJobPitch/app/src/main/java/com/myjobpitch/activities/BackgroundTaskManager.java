package com.myjobpitch.activities;

import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;

import java.util.ArrayList;
import java.util.List;

class BackgroundTaskManager {
    private List<APITask<?>> tasks = new ArrayList<>();
    private List<Runnable> taskCompletionActions = new ArrayList<>();

    public synchronized void addTaskCompletionAction(Runnable runnable) {
        taskCompletionActions.add(runnable);
    }

    public synchronized void addBackgroundTask(final APITask<?> task) {
        tasks.add(task);
        task.addListener(new APITaskListener() {
            @Override
            public void onPostExecute(Object result) {
                removeTask(task);
            }

            @Override
            public void onCancelled() {
                removeTask(task);
            }
        });
        // Update tasks now, in case the task finished while we were
        // faffing around up above
        for (APITask<?> t : new ArrayList<>(tasks))
            if (task.isExecuted())
                tasks.remove(task);
        checkTasksComplete();
    }

    private synchronized void removeTask(APITask<?> task) {
        tasks.remove(task);
        checkTasksComplete();
    }

    private void checkTasksComplete() {
        if (tasks.isEmpty())
            for (Runnable action : taskCompletionActions)
                action.run();
    }
}
