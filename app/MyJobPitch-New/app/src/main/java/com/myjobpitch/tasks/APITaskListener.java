package com.myjobpitch.tasks;

/**
* Created by Jamie on 11/04/2015.
*/
public interface APITaskListener<T> {
    void onPostExecute(T result);
    void onCancelled();
}
