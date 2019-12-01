using System;

namespace LayaExport
{
    public class ExportAttributeInfo
    {
        public Type type;
        public ExportAttribute att;
    }

    public class ExportAttribute : Attribute
    {
        public Type com;

        public ExportAttribute(Type t)
        {
            com = t;
        }
    }
}