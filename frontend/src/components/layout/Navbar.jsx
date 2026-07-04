import { useState, useEffect, useRef } from 'react';
import { Link, NavLink as RRNavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Home, MessageCircle, LayoutGrid, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* silent - notifications are non-critical */
    }
  };

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => loadNotifications();
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    loadNotifications();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const dashboardLink =
    user.role === 'tenant' ? '/browse' : user.role === 'owner' ? '/owner' : '/admin';

  // nav items per role (reused by desktop + mobile)
  const navItems =
    user.role === 'tenant'
      ? [
          { to: '/browse', icon: LayoutGrid, label: 'Browse' },
          { to: '/interests', icon: MessageCircle, label: 'Interests' },
        ]
      : user.role === 'owner'
      ? [
          { to: '/owner', icon: LayoutGrid, label: 'Listings' },
          { to: '/interests', icon: MessageCircle, label: 'Requests' },
        ]
      : [{ to: '/admin', icon: ShieldCheck, label: 'Admin' }];

  return (
    <>
      {/* ============ TOP NAVBAR — dark glass ============ */}
      <header className="sticky top-0 z-40 fm-nav-glass">
        {/* gradient glow line at the very bottom edge */}
        <div className="fm-nav-edge" aria-hidden />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to={dashboardLink} className="group flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-jade to-jade-dark flex items-center justify-center shadow-glowJade transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Home size={16} className="text-paper" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight text-paper">
              Flat<span className="fm-gradient-text">Match</span>
            </span>
          </Link>

          {/* Desktop nav — tinted glass pill */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full fm-nav-pill">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Notifications */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center fm-icon-btn transition-all hover:-translate-y-0.5"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-coral text-paper text-[10px] font-bold flex items-center justify-center ring-2 ring-paper">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 card p-2 max-h-96 overflow-y-auto animate-fadeUp">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-jade-dark font-medium hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 && (
                    <p className="text-sm text-slate px-2 py-6 text-center">You're all caught up.</p>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-jade-light/40 ${
                        !n.isRead ? 'bg-jade-light/60' : ''
                      }`}
                    >
                      <p className="font-medium text-ink leading-snug">{n.title}</p>
                      {n.body && <p className="text-xs text-slate mt-0.5">{n.body}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <Link
              to="/profile"
              className="flex items-center gap-2 pl-2 ml-0.5 border-l border-white/10 hover:bg-white/10 rounded-xl pr-2 py-1 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brass-light to-brass/40 flex items-center justify-center text-xs font-bold text-brass-dark ring-1 ring-brass/25">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-paper">{user.name?.split(' ')[0]}</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl flex items-center justify-center fm-icon-btn-coral transition-all hover:-translate-y-0.5"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ============ MOBILE BOTTOM NAV — colored glass ============ */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 fm-bottom-nav">
        <div className="fm-nav-edge-top" aria-hidden />
        <div className="flex items-center justify-around px-2 py-2 safe-bottom">
          {navItems.map((item) => (
            <MobileNavItem key={item.to} {...item} />
          ))}
          <Link
            to="/profile"
            className="fm-mob-item group"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brass-light to-brass/40 flex items-center justify-center text-[10px] font-bold text-brass-dark">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

/* ---- Desktop NavItem (jade-glow active on dark) ---- */
function NavItem({ to, icon: Icon, label }) {
  return (
    <RRNavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          isActive
            ? 'fm-nav-active text-[#6ee7b7]'
            : 'text-slate-light hover:text-paper hover:bg-white/10'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={15} className={isActive ? 'scale-110 transition-transform' : 'transition-transform'} />
          {label}
        </>
      )}
    </RRNavLink>
  );
}

/* ---- Mobile NavItem ---- */
function MobileNavItem({ to, icon: Icon, label }) {
  return (
    <RRNavLink
      to={to}
      className={({ isActive }) =>
        `fm-mob-item group ${isActive ? 'fm-mob-active' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={isActive ? 'scale-110 transition-transform' : 'transition-transform'} />
          <span>{label}</span>
        </>
      )}
    </RRNavLink>
  );
}
