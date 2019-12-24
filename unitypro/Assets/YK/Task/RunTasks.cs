using System;
using System.Collections.Generic;
using LayaExport;
using UnityEditor;
using UnityEngine;

namespace YK.Task
{
    [Export(typeof(RunTasks))]
    public class RunTasks : BaseComExport<RunTasks>
    {
        public List<TaskData> tasks = new List<TaskData>();

        public override string ClasName => "YK.RunTasks";

        public override string OnBuild()
        {
            throw new NotImplementedException();
        }
    }

    internal class test : PropertyAttribute
    {
    }

    [CustomPropertyDrawer(typeof(test))]
    internal class testEditor : PropertyDrawer
    {
        public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
        {
//            Debug.Log(property.type);
            base.OnGUI(position, property, label);
        }
    }
}