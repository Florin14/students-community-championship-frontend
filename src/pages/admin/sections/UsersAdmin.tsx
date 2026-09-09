import { Button } from "@mui/material";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { useEffect, useState } from "react";

import ConfirmDialog from "../../../components/reusable/ConfirmDialog";
import EmptyState from "../../../components/reusable/EmptyState";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  deleteUserThunk,
  fetchUsers,
} from "../../../store/slices/thunks/usersThunks";
import type { PlatformUser } from "../../../types";
import {
  AdminCard,
  AdminTable,
  IconAction,
  RowActions,
  TableWrap,
  Toolbar,
  ToolbarGroup,
} from "../adminUi";
import UserModal from "../modals/UserModal";

const StatusPill = ({ active, label }: { active: boolean; label: string }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 9px",
      borderRadius: 999,
      fontFamily: '"Sora", sans-serif',
      fontSize: "0.7rem",
      fontWeight: 700,
      background: active ? "var(--accent-soft)" : "var(--bg-surface)",
      color: active ? "var(--accent)" : "var(--text-secondary)",
    }}
  >
    {label}
  </span>
);

/**
 * Operator, admin and super-admin accounts.
 *
 * These are the accounts that run match day, so the screen shows the role and
 * whether the account is still usable at a glance.
 */
const UsersAdmin = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { users } = useAppSelector((state) => state.users);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformUser | null>(null);
  const [deleting, setDeleting] = useState<PlatformUser | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!deleting) return;
    const action = await dispatch(deleteUserThunk({ id: deleting.id }));
    setDeleting(null);
    dispatch(
      showSnackbar(
        deleteUserThunk.fulfilled.match(action)
          ? { message: t(language, "admin.deleted"), severity: "success" }
          : {
              message: String(
                action.payload ?? t(language, "admin.saveFailed")
              ),
              severity: "error",
            }
      )
    );
  };

  return (
    <AdminCard>
      <Toolbar>
        <ToolbarGroup />
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          {t(language, "admin.users.add")}
        </Button>
      </Toolbar>

      {users.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title={t(language, "admin.users.empty")}
          subtitle={t(language, "admin.users.emptyHint")}
        />
      ) : (
        <TableWrap>
          <AdminTable>
            <thead>
              <tr>
                <th>{t(language, "admin.users.colName")}</th>
                <th>{t(language, "admin.users.colEmail")}</th>
                <th>{t(language, "admin.users.colRole")}</th>
                <th>{t(language, "admin.users.colStatus")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {user.email}
                  </td>
                  <td>{t(language, ("role." + user.role) as never)}</td>
                  <td>
                    <StatusPill
                      active={user.isActive}
                      label={t(
                        language,
                        user.isActive
                          ? "admin.users.active"
                          : "admin.users.disabled"
                      )}
                    />
                  </td>
                  <td>
                    <RowActions>
                      <IconAction
                        title={t(language, "common.edit")}
                        onClick={() => {
                          setEditing(user);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </IconAction>
                      <IconAction
                        $tone="danger"
                        title={t(language, "common.delete")}
                        disabled={user.id === currentUser?.id}
                        onClick={() => setDeleting(user)}
                      >
                        <Trash2 size={15} />
                      </IconAction>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </TableWrap>
      )}

      <UserModal
        open={modalOpen}
        user={editing}
        onClose={() => setModalOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={t(language, "admin.users.deleteTitle")}
        description={t(language, "admin.users.deleteDescription")}
        confirmLabel={t(language, "common.delete")}
        cancelLabel={t(language, "common.cancel")}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </AdminCard>
  );
};

export default UsersAdmin;
