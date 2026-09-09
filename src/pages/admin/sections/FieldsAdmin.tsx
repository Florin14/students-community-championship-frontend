import { Button } from "@mui/material";
import { Flag, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import ConfirmDialog from "../../../components/reusable/ConfirmDialog";
import EmptyState from "../../../components/reusable/EmptyState";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  deleteFieldThunk,
  fetchFields,
} from "../../../store/slices/thunks/fieldsThunks";
import type { Field } from "../../../types";
import {
  AdminCard,
  AdminTable,
  IconAction,
  RowActions,
  TableWrap,
  Toolbar,
  ToolbarGroup,
} from "../adminUi";
import FieldModal from "../modals/FieldModal";

/**
 * The playing surfaces. Four matches run in parallel, one per field, and an
 * operator is assigned to the field they are standing next to.
 */
const FieldsAdmin = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { fields } = useAppSelector((state) => state.fields);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Field | null>(null);
  const [deleting, setDeleting] = useState<Field | null>(null);

  useEffect(() => {
    dispatch(fetchFields());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!deleting) return;
    const action = await dispatch(deleteFieldThunk({ id: deleting.id }));
    setDeleting(null);
    dispatch(
      showSnackbar(
        deleteFieldThunk.fulfilled.match(action)
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
          {t(language, "admin.fields.add")}
        </Button>
      </Toolbar>

      {fields.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={t(language, "admin.fields.empty")}
          subtitle={t(language, "admin.fields.emptyHint")}
        />
      ) : (
        <TableWrap>
          <AdminTable>
            <thead>
              <tr>
                <th>{t(language, "admin.fields.colName")}</th>
                <th>{t(language, "admin.fields.colShortName")}</th>
                <th>{t(language, "admin.fields.colLocation")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id}>
                  <td>
                    <strong>{field.name}</strong>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {field.shortName ?? "—"}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {field.location ?? "—"}
                  </td>
                  <td>
                    <RowActions>
                      <IconAction
                        title={t(language, "common.edit")}
                        onClick={() => {
                          setEditing(field);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </IconAction>
                      <IconAction
                        $tone="danger"
                        title={t(language, "common.delete")}
                        onClick={() => setDeleting(field)}
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

      <FieldModal
        open={modalOpen}
        field={editing}
        onClose={() => setModalOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={t(language, "admin.fields.deleteTitle")}
        description={t(language, "admin.fields.deleteDescription")}
        confirmLabel={t(language, "common.delete")}
        cancelLabel={t(language, "common.cancel")}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </AdminCard>
  );
};

export default FieldsAdmin;
