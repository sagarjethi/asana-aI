'use client'

import { LuLayoutDashboard } from 'react-icons/lu'
import { ImStatsDots } from 'react-icons/im'
import { PiBowlFoodLight } from 'react-icons/pi'
import { RiUser6Line } from 'react-icons/ri'
import { TbTrophy } from 'react-icons/tb'
import { IoHomeOutline } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { activeWindow } from '@/lib/store/dashboard/dashboardSlice'
import { useRouter } from 'next/navigation'
import Logout from './Logout'
import AppSidebar, { SidebarItem } from '@/app/components/Shell/AppSidebar'

export default function Sidebar() {
    const { push } = useRouter()

    const activeWindows = useSelector(
        (state: RootState) => state.dashboard.activeWindow
    )
    const dispatch = useDispatch<AppDispatch>()

    const select = (key: string) => {
        if (key === 'home') {
            push('/')
            return
        }
        dispatch(activeWindow(key))
    }

    const items: SidebarItem[] = [
        { key: 'home', title: 'Home', icon: <IoHomeOutline />, onClick: () => select('home') },
        {
            key: 'dashboard',
            title: 'Dashboard',
            icon: <LuLayoutDashboard />,
            onClick: () => select('dashboard'),
            active: activeWindows === 'dashboard',
        },
        {
            key: 'stats',
            title: 'Stats',
            icon: <ImStatsDots />,
            onClick: () => select('stats'),
            active: activeWindows === 'stats',
        },
        {
            key: 'badges',
            title: 'Badges',
            icon: <TbTrophy />,
            onClick: () => select('badges'),
            active: activeWindows === 'badges',
        },
        {
            key: 'diet',
            title: 'Diet',
            icon: <PiBowlFoodLight />,
            onClick: () => select('diet'),
            active: activeWindows === 'diet',
        },
    ]

    const footerItems: SidebarItem[] = [
        {
            key: 'profile',
            title: 'Profile',
            icon: <RiUser6Line />,
            onClick: () => select('profile'),
            active: activeWindows === 'profile',
        },
        {
            key: 'logout',
            title: 'Logout',
            icon: null,
            render: (compact: boolean) => (
                <div
                    className={`logout-row relative flex items-center ${
                        compact ? 'justify-center px-2' : 'gap-3 px-3'
                    } py-2.5 rounded-xl cursor-pointer duration-300
                        text-ink-800/80 hover:bg-cream-100`}
                >
                    <Logout />
                </div>
            ),
        },
    ]

    return (
        <AppSidebar
            items={items}
            footerItems={footerItems}
            mobileTitle={activeWindows}
        />
    )
}
