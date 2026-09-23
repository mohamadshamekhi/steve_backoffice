'use client';
import { usePathname } from 'next/navigation';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import collapseLogo from '../../../../../public/images/_general/logo-image.png';
import logo from '../../../../../public/images/_general/logo.png';

import ChevronDownIcon from 'libs/components/icons/ChevronDownIcon';
import HorizontalDotsIcon from 'libs/components/icons/HorizontalDotsIcon';
import useMediaQuery from 'libs/hooks/mediaQuery/useMediaQuery';
import { SCOPED_ONLY_ROLES } from 'libs/components/common/ScopedRoleGuard';
import ROUTES from 'libs/constants/routes/routes.constants';
import { isSuperAdmin, useACLStore } from 'libs/state/stores/acl';
import { useSidebarStore } from 'libs/state/stores/sidebar';
import { Link } from 'libs/ui';
import Image from 'next/image';
import NavItem from 'types/sidebar/navItem.types';
import SidebarWidget from '../SidebarWidget';
import { navItems } from './navItems/NavItems';

const Sidebar: React.FC = () => {
    const isExpanded = useSidebarStore((state) => state.isExpanded);
    const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
    const isHovered = useSidebarStore((state) => state.isHovered);
    const setIsHovered = useSidebarStore((state) => state.setIsHovered);

    const isMobile = useMediaQuery('lg');

    const permissions = useACLStore((state) => state.permissions);
    const roles = useACLStore((state) => state.roles);

    const visibleNavItems: NavItem[] = useMemo(() => {
        const keys = permissions ?? [];
        const userRoles = roles ?? [];

        // A user whose every role is "scoped-only" (e.g. a pure partner) never sees the
        // full admin nav — only the dashboard landing and menus scoped to their role.
        const isScopedOnly =
            userRoles.length > 0 && userRoles.every((role) => SCOPED_ONLY_ROLES.includes(role));

        const superAdmin = isSuperAdmin(userRoles);
        const hasPermission = (permission?: string) => !!permission && (superAdmin || keys.includes(permission));
        const hasAnyRole = (itemRoles?: string[]) =>
            !!itemRoles && (superAdmin || itemRoles.some((role) => userRoles.includes(role)));

        // An item can be gated by `permission`, `roles`, or both. When both are set,
        // holding EITHER grants access. Items scoped entirely to "scoped-only" roles
        // (the partner shop) are shown only to users who are themselves scoped-only.
        const isGateAllowed = (item: { permission?: string; roles?: string[] }) => {
            const { permission, roles: itemRoles } = item;
            if (itemRoles && itemRoles.every((role) => SCOPED_ONLY_ROLES.includes(role))) {
                return isScopedOnly && hasAnyRole(itemRoles);
            }
            if (!permission && !itemRoles) return true;
            return hasPermission(permission) || hasAnyRole(itemRoles);
        };

        return navItems
            .filter((nav) => {
                if (isScopedOnly) return nav.path === ROUTES.Dashboard || !!nav.roles;
                return true;
            })
            .map((nav) => {
                if (nav.subItems) {
                    return { ...nav, subItems: nav.subItems.filter(isGateAllowed) };
                }
                return nav;
            })
            .filter((nav) => {
                if (!isGateAllowed(nav)) return false;
                if (nav.subItems && nav.subItems.length === 0 && !nav.path) return false;
                return true;
            });
    }, [permissions, roles]);

    const pathname = usePathname();

    const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});

    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const isActive = useCallback((path: string) => pathname === path, [pathname]);

    useEffect(() => {
        if (!isMobile) {
            useSidebarStore.setState({ isMobileOpen: false });
        }
    }, [isMobile]);

    useEffect(() => {
        let submenuMatched = false;
        visibleNavItems.forEach((nav, index) => {
            if (nav.subItems) {
                nav.subItems.forEach((subItem) => {
                    if (isActive(subItem.path)) {
                        setOpenSubmenu(index);
                        submenuMatched = true;
                    }
                });
            }
        });

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [isActive, visibleNavItems]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index: number) => {
        setOpenSubmenu((prev) => (prev === index ? null : index));
    };

    const renderMenuItems = (items: NavItem[]) => (
        <ul className='flex flex-col gap-4'>
            {items.map((nav, index) => (
                <Fragment key={nav.name}>
                    {nav.section && nav.section !== items[index - 1]?.section && (
                        <li aria-hidden={!isExpanded && !isHovered && !isMobileOpen}>
                            <h2
                                className={`flex text-xs leading-[20px] text-gray-400 ${index > 0 ? 'mt-2' : ''} ${
                                    !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    nav.section
                                ) : (
                                    <HorizontalDotsIcon className='size-6' />
                                )}
                            </h2>
                        </li>
                    )}
                    <li>
                        {nav.subItems ? (
                            <button
                                onClick={() => handleSubmenuToggle(index)}
                                className={`menu-item group ${
                                    openSubmenu === index ? 'menu-item-active' : 'menu-item-inactive'
                                } cursor-pointer ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
                            >
                                <span
                                    className={`menu-item-icon-size ${
                                        openSubmenu === index ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                                    }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className='menu-item-text'>{nav.name}</span>
                                )}
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <ChevronDownIcon
                                        className={`mr-auto h-5 w-5 transition-transform duration-200 ${
                                            openSubmenu === index ? 'text-brand-500 rotate-180' : ''
                                        }`}
                                    />
                                )}
                            </button>
                        ) : (
                            nav.path && (
                                <Link
                                    href={nav.path}
                                    className={`menu-item group ${
                                        isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                                    }`}
                                >
                                    <span
                                        className={`menu-item-icon-size ${
                                            isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                                        }`}
                                    >
                                        {nav.icon}
                                    </span>
                                    {(isExpanded || isHovered || isMobileOpen) && (
                                        <span className='menu-item-text'>{nav.name}</span>
                                    )}
                                </Link>
                            )
                        )}
                        {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                            <div
                                ref={(el) => {
                                    subMenuRefs.current[`${index}`] = el;
                                }}
                                className='overflow-hidden transition-all duration-300'
                                style={{
                                    height: openSubmenu === index ? `${subMenuHeight[`${index}`]}px` : '0px'
                                }}
                            >
                                <ul className='mt-2 ml-9 space-y-1'>
                                    {nav.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                href={subItem.path}
                                                className={`menu-dropdown-item ${
                                                    isActive(subItem.path)
                                                        ? 'menu-dropdown-item-active'
                                                        : 'menu-dropdown-item-inactive'
                                                }`}
                                            >
                                                {subItem.name}
                                                <span className='ml-auto flex items-center gap-1'>
                                                    {subItem.new && (
                                                        <span
                                                            className={`ml-auto ${
                                                                isActive(subItem.path)
                                                                    ? 'menu-dropdown-badge-active'
                                                                    : 'menu-dropdown-badge-inactive'
                                                            } menu-dropdown-badge`}
                                                        >
                                                            new
                                                        </span>
                                                    )}
                                                    {subItem.pro && (
                                                        <span
                                                            className={`ml-auto ${
                                                                isActive(subItem.path)
                                                                    ? 'menu-dropdown-badge-active'
                                                                    : 'menu-dropdown-badge-inactive'
                                                            } menu-dropdown-badge`}
                                                        >
                                                            pro
                                                        </span>
                                                    )}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                </Fragment>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed top-0 right-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
                isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'
            } ${isMobileOpen ? '-translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`flex py-8 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
                <Link href='/'>
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <Image className='dark:hidden' src={logo} alt='Logo' width={80} height={20} />
                            <Image className='hidden dark:block' src={logo} alt='Logo' width={80} height={20} />
                        </>
                    ) : (
                        <Image src={collapseLogo} alt='steve' width={30} height={30} />
                    )}
                </Link>
            </div>
            <div className='no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear'>
                <nav className='mb-6'>
                    <div className='flex flex-col gap-4'>
                        <div>{renderMenuItems(visibleNavItems)}</div>
                    </div>
                </nav>
                {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
            </div>
        </aside>
    );
};

export default Sidebar;
