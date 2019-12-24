using System;
using UnityEngine;

[Serializable]
public class TaskData
{
    [Header("任务名称")] public string taskName;
    [Header("任务目标")] public string taskTarget;
}

[UnityEditor.CustomEditor(typeof(TaskData))]
public class Test : UnityEditor.Editor
{
    public override void OnInspectorGUI()
    {
        base.OnInspectorGUI();
    }
}