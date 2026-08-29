import { redirect } from "next/navigation";
import UsersManager from "@/components/admin/settings/UsersManager";
import { getSession } from "@/lib/auth/session";
export default async function SettingsPage(){const session=await getSession();if(session?.role!=="ADMIN")redirect('/admin');return <UsersManager/>}
