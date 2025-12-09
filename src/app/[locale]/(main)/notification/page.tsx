"use client";

import { useGetNotificationsByUserQuery } from "@/app/modules/hospital/hooks/queries/notification/use-get-all-notification.query";
import { useAppSelector } from "@/app/shares/stores";
import { Button, Empty, Popover, Spin, Tabs, Typography, message } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MdMoreHoriz } from "react-icons/md";
import { useLocale, useTranslations } from "next-intl";
import "dayjs/locale/vi";
import { useMarkAllNotificationsReadMutation } from "@/app/modules/hospital/hooks/mutations/notifications/use-mark-all-read.mutation";
import { useMarkNotificationReadMutation } from "@/app/modules/hospital/hooks/mutations/notifications/use-mark-read.mutation";

dayjs.extend(relativeTime);

export default function NotificationsPage() {
  const t = useTranslations("home");
  const auth = useAppSelector((state) => state.auth);
  const locale = useLocale();
  dayjs.locale(locale === "vi" ? "vi" : "en");

  const { data, isLoading } = useGetNotificationsByUserQuery(auth.patient?.patientId || "");
  const markAllMutation = useMarkAllNotificationsReadMutation();
  const markSingleMutation = useMarkNotificationReadMutation();

  const [tab, setTab] = useState("all");
  const notifications = Array.isArray(data?.data) ? data.data : [];

  const filteredNotifications = useMemo(() => {
    return tab === "unread" ? notifications.filter((n) => !n.read) : notifications;
  }, [tab, notifications]);

  type NotificationItem = {
    id: string;
    read?: boolean;
    title?: string;
    message?: string;
    createdAt: string;
    [key: string]: unknown;
  };

  const grouped = useMemo(() => {
    const today = dayjs().startOf("day");
    const groups: { today: NotificationItem[]; earlier: NotificationItem[] } = {
      today: [],
      earlier: [],
    };
    filteredNotifications.forEach((n) =>
      dayjs(n.createdAt).isAfter(today)
        ? groups.today.push(n as NotificationItem)
        : groups.earlier.push(n as NotificationItem),
    );
    return groups;
  }, [filteredNotifications]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  const handleClickNotification = (id: string, read?: boolean) => {
    if (!read) {
      markSingleMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header + Tabs */}
        <div className="border-b border-gray-100 px-6 pt-6 pb-2 bg-white">
          <div className="flex justify-between items-center mb-4">
            <Typography.Title
              level={3}
              className="text-2xl !mb-0 bg-gradient-to-r from-[#1250dc] to-[#3b82f6] text-transparent bg-clip-text"
            >
              {t("profile.notification.title")}
            </Typography.Title>
            <div className="flex items-center gap-2">
              <Popover
                placement="bottomRight"
                trigger="click"
                content={
                  <div className="flex flex-col">
                    <Button
                      type="text"
                      size="small"
                      onClick={() => {
                        const patientId = auth.patient?.patientId;
                        if (patientId) {
                          markAllMutation.mutate(patientId);
                        } else {
                          message.error(t("header.patientNotFound"));
                        }
                      }}
                      disabled={filteredNotifications.every((n) => n.read)}
                    >
                      {t("profile.notification.markAllRead")}
                    </Button>
                  </div>
                }
              >
                <Button type="text" icon={<MdMoreHoriz size={24} />} />
              </Popover>
            </div>
          </div>

          <Tabs
            activeKey={tab}
            onChange={(key) => setTab(key)}
            items={[
              { key: "all", label: t("profile.notification.tabs.all") },
              { key: "unread", label: t("profile.notification.tabs.unread") },
            ]}
          />
        </div>

        {/* Danh sách */}
        <div className="px-6 py-4 bg-white">
          {filteredNotifications.length === 0 ? (
            <Empty description={t("profile.notification.empty")} />
          ) : (
            <>
              {grouped.today.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-3">
                    {t("profile.notification.groups.today")}
                  </h3>
                  <div className="space-y-2">
                    {grouped.today.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                          !item.read
                            ? "bg-blue-50 border-blue-100 hover:bg-blue-100/60"
                            : "hover:bg-gray-50 border-gray-100"
                        }`}
                        onClick={() => handleClickNotification(item.id, item.read)}
                      >
                        <div className="flex-1">
                          <p className="text-[15px] font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600 leading-snug mt-1">{item.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {dayjs(item.createdAt).fromNow()}
                          </p>
                        </div>
                        {!item.read && (
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {grouped.earlier.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-3">
                    {t("profile.notification.groups.earlier")}
                  </h3>
                  <div className="space-y-2">
                    {grouped.earlier.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                          !item.read
                            ? "bg-blue-50 border-blue-100 hover:bg-blue-100/60"
                            : "hover:bg-gray-50 border-gray-100"
                        }`}
                        onClick={() => handleClickNotification(item.id, item.read)}
                      >
                        <div className="flex-1">
                          <p className="text-[15px] font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600 leading-snug mt-1">{item.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {dayjs(item.createdAt).fromNow()}
                          </p>
                        </div>
                        {!item.read && (
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
