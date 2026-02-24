import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">ตั้งค่า</h2>
                    <p className="text-sm text-gray-500 mt-1">ตั้งค่าระบบและการจัดการ</p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-300">
                <Settings className="h-16 w-16 mb-4" />
                <p className="text-lg font-medium">เร็ว ๆ นี้</p>
                <p className="text-sm mt-1">หน้านี้กำลังอยู่ระหว่างการพัฒนา</p>
            </div>
        </div>
    );
}
